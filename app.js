import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapPin, Clock, DollarSign, Users, TrendingUp, Sun, Scissors, Phone, ChevronRight, CheckCircle2, Circle, XCircle, Star, Play, Square, History, Info, Pencil, LogOut } from "lucide-react";

// ---------- PHASE 1: SCOPED STORAGE WRAPPER ----------
// Auto-prefix all storage keys with userId for multi-user data isolation.
// This wrapper seamlessly enables per-user data without changing app.js logic.
function createScopedStorage() {
  // Override window.storage.get/set/delete/list to auto-prefix keys with userId
  const original = window.storage;
  const scopedStorage = {
    async get(key, shared) {
      const userId = window.authModule?.supabase.getUserId?.();
      const scopedKey = userId && !shared ? `${userId}:${key}` : key;
      return original.get(scopedKey, false); // Always use personal storage (false) for the underlying call
    },
    async set(key, value, shared) {
      const userId = window.authModule?.supabase.getUserId?.();
      const scopedKey = userId && !shared ? `${userId}:${key}` : key;
      return original.set(scopedKey, value, false); // Always use personal storage (false) for the underlying call
    },
    async delete(key, shared) {
      const userId = window.authModule?.supabase.getUserId?.();
      const scopedKey = userId && !shared ? `${userId}:${key}` : key;
      return original.delete(scopedKey, false);
    },
    async list(shared) {
      const userId = window.authModule?.supabase.getUserId?.();
      if (!userId || shared) return original.list(false);
      // For multi-user apps, list only keys matching this userId prefix
      const allKeys = await original.list(false);
      const prefix = `${userId}:`;
      return allKeys.filter(k => k.startsWith(prefix));
    }
  };
  return scopedStorage;
}

// Initialize scoped storage, but don't override window.storage until auth is ready
let scopedStorage = null;
function initScopedStorage() {
  if (!scopedStorage) {
    scopedStorage = createScopedStorage();
    // Override the global storage only after auth is ready
    const originalStorage = window.storage;
    window.storage = {
      ...scopedStorage,
      // Preserve any other methods the original storage might have
      ...originalStorage
    };
  }
}

// ---------- SEED DATA (Mow Masters of Edmond — Lawncare Bible, as of 8/10/2026) ----------

// Starting client list — used only to seed local storage the very first time the app
// runs on a device. After that, the live list lives in storage and is edited in-app
// via the Clients tab, never by editing this code again.
const SEED_CLIENTS = [{
  id: "greg",
  name: "Greg Weides",
  address: "15801 Petaluma Pl",
  cluster: "Edmond",
  day: "Thursday",
  time: "5:00-6:30 PM",
  price: 65,
  status: "active",
  duration: 47,
  phone: "469-407-3440"
}, {
  id: "corinne",
  name: "Corinne Taylor-Davis",
  address: "321 Antelope Trl",
  cluster: "Edmond",
  day: "Thursday",
  time: "6:45-7:45 PM",
  price: 65,
  status: "active",
  duration: 60,
  phone: ""
}, {
  id: "haley",
  name: "Haley Ackerman",
  address: "1012 Earl A Rodkey Dr",
  cluster: "Edmond",
  day: "Wednesday",
  time: "5:45-7:15 PM",
  price: 40,
  status: "active",
  duration: 33,
  phone: "",
  note: ""
}, {
  id: "holly",
  name: "Holly Huntley",
  address: "2408 Fairfield Dr",
  cluster: "Edmond",
  day: "Tuesday",
  time: "6:15-7:00 PM",
  price: 55,
  status: "active",
  duration: 45,
  phone: "3059421851",
  note: "$105 first visit"
}, {
  id: "rionna",
  name: "Rionna Allen",
  address: "801 Rolling Hills Ter",
  cluster: "Edmond",
  day: "Tuesday",
  time: "5:00-6:00 PM",
  price: 50,
  status: "active",
  duration: null,
  phone: "",
  note: ""
}, {
  id: "jose",
  name: "Jose Gonzalez",
  address: "400 Abilene Ave",
  cluster: "Edmond",
  day: "Tuesday",
  time: "5:00-6:00 PM",
  price: 35,
  status: "active",
  duration: 30,
  phone: "",
  note: ""
}, {
  id: "evan-peyton",
  name: "Evan / Peyton Flury",
  address: "701 Cherryvale",
  cluster: "Edmond",
  day: "Wednesday",
  time: "5:00-5:30 PM",
  price: 40,
  status: "active",
  duration: 30,
  phone: "",
  note: ""
}, {
  id: "cheyenne",
  name: "Cheyenne Bouseman",
  address: "624 NW 187th Ct",
  cluster: "Edmond",
  day: "Wednesday",
  time: "5:00-6:20 PM",
  price: 60,
  status: "active",
  duration: 40,
  phone: "",
  note: ""
}, {
  id: "miriam",
  name: "Miriam Conrady",
  address: "2817 Old Hickory Dr",
  cluster: "Edmond",
  day: "Wednesday",
  time: "6:35-8:15 PM",
  price: 45,
  status: "active",
  duration: 45,
  phone: "",
  note: ""
}, {
  id: "peyton-cherry",
  name: "Peyton Flury (701 Cherryvale)",
  address: "701 Cherryvale",
  cluster: "Edmond",
  day: "Wednesday",
  time: "—",
  price: 40,
  status: "active",
  duration: 45,
  phone: ""
}, {
  id: "angela",
  name: "Angela Kuhlman",
  address: "1317 SW 25th St",
  cluster: "Moore",
  day: "Friday",
  time: "6:00-7:00 PM",
  price: 55,
  status: "active",
  duration: null,
  phone: ""
}, {
  id: "cody",
  name: "Cody Ribble",
  address: "1616 Exeter Ct",
  cluster: "Choctaw",
  day: "Monday",
  time: "5:00-5:45 PM",
  price: 55,
  status: "active",
  duration: null,
  phone: "",
  note: "Solo Monday route"
}, {
  id: "erin",
  name: "Erin Seapy",
  address: "724 Howard Ct",
  cluster: "Edmond",
  day: "As-needed",
  time: "TBD",
  price: 45,
  status: "as-needed",
  duration: null,
  phone: ""
}, {
  id: "kaelyn",
  name: "Kaelyn Gray",
  address: "3112 Kelsey Drive",
  cluster: "Edmond",
  day: "As-needed",
  time: "TBD",
  price: null,
  status: "as-needed",
  duration: null,
  phone: ""
}, {
  id: "stuart",
  name: "Stuart Hansen",
  address: "9881 Abbington Circle",
  cluster: "Edmond",
  day: "—",
  time: "—",
  price: 70,
  status: "inactive",
  duration: null,
  phone: "",
  note: "Inactive as of 8/10"
}, {
  id: "tara",
  name: "Tara Bolton",
  address: "1229 Whitehurst Ln",
  cluster: "Choctaw",
  day: "—",
  time: "—",
  price: 115,
  status: "inactive",
  duration: null,
  phone: "",
  note: "Inactive as of 8/10"
}, {
  id: "frances",
  name: "Frances Boggs",
  address: "2621 N Lincoln Ave",
  cluster: "Moore",
  day: "—",
  time: "—",
  price: 50,
  status: "inactive",
  duration: null,
  phone: ""
}, {
  id: "rianna",
  name: "Rianna Hardwick",
  address: "2908 Zachary Pl",
  cluster: "Spencer",
  day: "—",
  time: "—",
  price: null,
  status: "lost",
  duration: null,
  phone: ""
}, {
  id: "ashlyn",
  name: "Ashlyn Cox",
  address: "—",
  cluster: "Moore",
  day: "—",
  time: "—",
  price: 65,
  status: "lost",
  duration: null,
  phone: "",
  note: "Migrated from old Leads list — closed lost"
}, {
  id: "jennifer",
  name: "Jennifer Wickware",
  address: "—",
  cluster: "Moore",
  day: "—",
  time: "—",
  price: 45,
  status: "inactive",
  duration: null,
  phone: "",
  note: "Migrated from old Leads list — won as a one-time job"
}];
const ROUTE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SERVICE_INTERVALS = ["Weekly", "Bi-weekly", "Monthly"];
const WEEKEND_DAYS = ["Saturday", "Sunday"];
const GOAL_PER_DAY = 200;

// ---------- LIVE CLIENT STORE (backed by on-device storage, not code) ----------

const ClientsContext = /*#__PURE__*/React.createContext(null);
const CLIENTS_STORAGE_KEY = "clients-list";
function useClients() {
  const ctx = React.useContext(ClientsContext);
  if (!ctx) throw new Error("useClients must be used inside ClientsProvider");
  return ctx;
}
function ClientsProvider({
  children
}) {
  const [clients, setClients] = useState(null); // null while loading
  // addClient/updateClient/removeClient read from this ref (not the `clients` closure
  // variable) so that back-to-back calls in the same handler — e.g. adding a referral
  // then immediately discounting the referrer — each see the OTHER's change instead of
  // silently overwriting it with a stale snapshot.
  const clientsRef = useRef(null);
  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  useEffect(() => {
    (async () => {
      let loaded;
      try {
        const result = await window.storage.get(CLIENTS_STORAGE_KEY, true);
        loaded = result && result.value ? JSON.parse(result.value) : SEED_CLIENTS;
      } catch (e) {
        // first run on this device — seed it
        await window.storage.set(CLIENTS_STORAGE_KEY, JSON.stringify(SEED_CLIENTS), true);
        loaded = SEED_CLIENTS;
      }
      // Skip/reschedule overrides have to be in the cache before the first render,
      // since isDueThisWeek reads them synchronously while building the schedule.
      await Promise.all(loaded.map(c => loadVisitOverrides(c.id).catch(() => {})));
      clientsRef.current = loaded;
      setClients(loaded);
    })();
  }, []);
  const persist = async next => {
    clientsRef.current = next;
    setClients(next);
    try {
      await window.storage.set(CLIENTS_STORAGE_KEY, JSON.stringify(next), true);
    } catch (e) {
      // in-memory state still updates even if the save fails — worst case it
      // doesn't survive a reload, but this session keeps working
    }
  };
  const addClient = async client => {
    const id = client.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
    const next = [...(clientsRef.current || []), {
      id,
      duration: null,
      phone: "",
      ...client
    }];
    await persist(next);
    return id;
  };
  const updateClient = async (id, updates) => {
    const next = (clientsRef.current || []).map(c => c.id === id ? {
      ...c,
      ...updates
    } : c);
    await persist(next);
  };
  const removeClient = async id => {
    const next = (clientsRef.current || []).filter(c => c.id !== id);
    await persist(next);
  };
  return /*#__PURE__*/React.createElement(ClientsContext.Provider, {
    value: {
      clients: clients || [],
      loading: clients === null,
      addClient,
      updateClient,
      removeClient
    }
  }, children);
}

// ---------- HELPERS ----------

const fmt = n => n == null ? "—" : `$${n.toFixed ? n.toFixed(2) : n}`;

// MeasureLawn's PDFs use British spellings ("Fertiliser"). Normalized to US spelling
// for display and anything customer-facing, since the raw parsed text is stored as-is.
function normalizeTaskText(text) {
  if (!text) return text;
  return text.replace(/Fertiliser/g, "Fertilizer").replace(/fertiliser/g, "fertilizer").replace(/Fertilise/g, "Fertilize").replace(/fertilise/g, "fertilize");
}

// Builds a YYYY-MM-DD string from LOCAL date components, never UTC. This matters a lot:
// Date.toISOString() always converts to UTC, so for anyone west of UTC (e.g. Central
// time, 5-6 hours behind), any local evening timestamp after roughly 6-7pm has already
// rolled into "tomorrow" in UTC terms — silently mis-dating an evening visit stop,
// payment, or review to the wrong calendar day. Every "today's date" stamp in this app
// should go through this helper instead of `new Date().toISOString().slice(0,10)`.
function localDateISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Birthday stored as MM-DD only — no year is ever collected or shown.
function birthdayInfo(birthday) {
  if (!birthday) return null;
  const [month, day] = birthday.split("-").map(Number);
  if (!month || !day) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
  const daysAway = Math.round((next - today) / 86400000);
  const label = next.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  });
  return {
    label,
    daysAway,
    soon: daysAway <= 14
  };
}
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// The visit that lands on/after a client's birthday is comped — this finds that
// exact scheduled date so reminders and the payment button can both key off it.
function complimentaryVisitInfo(client) {
  const bday = birthdayInfo(client.birthday);
  if (!bday) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bdayDate = new Date(today);
  bdayDate.setDate(today.getDate() + bday.daysAway);
  const compVisit = nextOccurrence(client, bdayDate);
  if (!compVisit) return null;
  const compVisitISO = compVisit.toISOString().slice(0, 10);
  const compVisitLabel = compVisit.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  });
  return {
    bdayLabel: bday.label,
    bdayDaysAway: bday.daysAway,
    compVisitISO,
    compVisitLabel,
    isToday: compVisitISO === today.toISOString().slice(0, 10)
  };
}
// Win-back gate: for clients who went inactive/lost, the birthday freebie should only
// apply once they've actually recommitted to the schedule — not just because they showed
// up once. Defaults to "pending" the moment a lapsed client's birthday reminder appears,
// and only flips to "confirmed" via the explicit button in the birthday banner. Clients
// who were never inactive/lost never get a gate record, so their comp visits still apply
// automatically like before.
async function getWinbackGate(clientId) {
  try {
    const result = await window.storage.get(`winback-gate:${clientId}`, true);
    return result && result.value ? result.value : null;
  } catch (e) {
    return null;
  }
}
async function setWinbackGate(clientId, value) {
  try {
    await window.storage.set(`winback-gate:${clientId}`, value, true);
  } catch (e) {
    // best-effort — not critical if this fails once
  }
}
function daysInMonth(month) {
  // Use a leap year (2024) so Feb 29 is always selectable — birthdays repeat
  // every year regardless of whether the current year is a leap year.
  return new Date(2024, month, 0).getDate();
}
function BirthdayInput({
  value,
  onChange,
  inputStyle
}) {
  const [month, day] = (value || "").split("-").map(v => v ? Number(v) : null);
  const setMonth = m => {
    const maxDay = daysInMonth(m);
    const clampedDay = day && day <= maxDay ? day : null;
    onChange(clampedDay ? `${String(m).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}` : `${String(m).padStart(2, "0")}-`);
  };
  const setDay = d => {
    if (!month) return;
    onChange(`${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  };
  const dayCount = month ? daysInMonth(month) : 31;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: month || "",
    onChange: e => e.target.value ? setMonth(Number(e.target.value)) : onChange(""),
    style: inputStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Month"), MONTH_NAMES.map((name, i) => /*#__PURE__*/React.createElement("option", {
    key: name,
    value: i + 1
  }, name))), /*#__PURE__*/React.createElement("select", {
    value: day || "",
    onChange: e => e.target.value && setDay(Number(e.target.value)),
    disabled: !month,
    style: inputStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Day"), Array.from({
    length: dayCount
  }, (_, i) => i + 1).map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d))));
}
const ROUTE_DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};
const INTERVAL_WEEKS = {
  "Weekly": 1,
  "Bi-weekly": 2,
  "Monthly": 4
};
// One-off schedule exceptions, kept separate from the recurring cadence so neither a
// skip nor a reschedule permanently shifts a client's interval. Shape:
//   { skips: ["2026-08-25", ...], moves: { "2026-08-25": "2026-08-27", ... } }
// Loaded once into a module-level cache because isDueThisWeek/clientsForDay are called
// synchronously all over the render path and can't await storage per call.
const visitOverridesCache = {};
function getVisitOverrides(clientId) {
  return visitOverridesCache[clientId] || {
    skips: [],
    moves: {}
  };
}
async function loadVisitOverrides(clientId) {
  try {
    const result = await window.storage.get(`visit-overrides:${clientId}`, true);
    const parsed = result && result.value ? JSON.parse(result.value) : {
      skips: [],
      moves: {}
    };
    visitOverridesCache[clientId] = {
      skips: parsed.skips || [],
      moves: parsed.moves || {}
    };
  } catch (e) {
    visitOverridesCache[clientId] = {
      skips: [],
      moves: {}
    };
  }
  return visitOverridesCache[clientId];
}
async function saveVisitOverrides(clientId, overrides) {
  visitOverridesCache[clientId] = overrides;
  const result = await window.storage.set(`visit-overrides:${clientId}`, JSON.stringify(overrides), true);
  if (!result) throw new Error("Storage failed");
}
// True if this client is actually due in the week containing `refDate`. Several things
// can hold a client back: a manually-set next-visit/start date in the future, the
// recurring cadence itself (bi-weekly/monthly), or a one-off skip/reschedule override.
function isDueThisWeek(client, refDate = new Date()) {
  const dayIdx = ROUTE_DAY_INDEX[client.day];
  if (dayIdx == null) return true;
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);
  const overrides = getVisitOverrides(client.id);
  // A visit moved *to* this exact date shows up here, even though it isn't the client's
  // normal weekday — so this is checked against refDate itself, not the weekday occurrence.
  const refISO = localDateISO(today);
  if (Object.values(overrides.moves).includes(refISO)) return true;
  const diffToTarget = dayIdx - today.getDay();
  const thisWeeksOccurrence = new Date(today);
  thisWeeksOccurrence.setDate(today.getDate() + diffToTarget);
  const thisWeekISO = localDateISO(thisWeeksOccurrence);
  // Skipped, or moved away to a different date — not due on its normal date.
  if (overrides.skips.includes(thisWeekISO)) return false;
  if (overrides.moves[thisWeekISO]) return false;
  if (client.nextVisitDate) {
    const startAnchor = new Date(client.nextVisitDate + "T00:00:00");
    if (!isNaN(startAnchor.getTime()) && thisWeeksOccurrence < startAnchor) return false;
  }
  const weeks = INTERVAL_WEEKS[client.frequency] || 1;
  if (weeks <= 1 || !client.nextVisitDate) return true;
  const anchor = new Date(client.nextVisitDate + "T00:00:00");
  if (isNaN(anchor.getTime())) return true;
  const daysDiff = Math.round((thisWeeksOccurrence - anchor) / 86400000);
  if (daysDiff % 7 !== 0) return true; // anchor isn't aligned to this weekday — don't hide, just show as-is
  const weeksDiff = daysDiff / 7;
  return ((weeksDiff % weeks) + weeks) % weeks === 0;
}
// Next real calendar date this client is due, walking forward from today.
// The nearest date (today or later) that falls on the given weekday — used to
// auto-anchor a bi-weekly/monthly cycle to "starting now" the moment the
// interval is picked, with no separate date field for the owner to fill in.
function nearestUpcomingWeekday(dayName, refDate = new Date()) {
  const dayIdx = ROUTE_DAY_INDEX[dayName];
  if (dayIdx == null) return "";
  const start = new Date(refDate);
  start.setHours(0, 0, 0, 0);
  const diff = (dayIdx - start.getDay() + 7) % 7;
  const d = new Date(start);
  d.setDate(start.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
function nextOccurrence(client, refDate = new Date()) {
  const dayIdx = ROUTE_DAY_INDEX[client.day];
  if (dayIdx == null) return null;
  const start = new Date(refDate);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() === dayIdx && isDueThisWeek(client, d)) return d;
  }
  return null;
}
function clientsForDay(clients, day, refDate) {
  return clients.filter(c => c.status === "active" && c.day === day && isDueThisWeek(c, refDate));
}
function dayRevenue(clients, day, refDate) {
  return clientsForDay(clients, day, refDate).reduce((sum, c) => sum + (c.price || 0), 0);
}
const CLUSTERS = ["Edmond", "Choctaw", "Moore", "Spencer"];
// Best-effort guess at which service area a free-text address belongs to, since the
// customer quote form only collects a street address, not separate city/zip fields.
function guessClusterFromAddress(address) {
  if (!address) return "Edmond";
  const lower = address.toLowerCase();
  const found = CLUSTERS.find(c => lower.includes(c.toLowerCase()));
  return found || "Edmond";
}
// A 5-digit zip is sometimes typed right into the street address field on the quote
// form even though there's no dedicated zip input — pull it out if it's there.
function guessZipFromAddress(address) {
  if (!address) return "";
  const match = address.match(/\b(\d{5})\b/);
  return match ? match[1] : "";
}
// Suggests the best route day for a new client using two signals: their requested day
// (if they gave one) and which day already has the most active/as-needed clients nearby.
// Zip code is the primary grouping signal — tighter and more accurate than city name,
// since one city can span several zips. Falls back to city/cluster only when a zip
// isn't on file yet (e.g. an existing client from before this field existed).
function suggestBestDay(location, requestedDay, clients) {
  const zip = typeof location === "string" ? "" : location.zip;
  const cluster = typeof location === "string" ? location : location.cluster;
  const routeReady = (clients || []).filter(c => (c.status === "active" || c.status === "as-needed") && c.day && ROUTE_DAYS.includes(c.day));
  const sameArea = zip ? routeReady.filter(c => c.zip === zip) : routeReady.filter(c => c.cluster === cluster);
  const usedZip = zip && sameArea.length > 0;
  // If nobody else shares this exact zip yet, widen to the city/cluster instead of
  // suggesting an empty comparison — still useful, just less precise.
  const comparisonSet = sameArea.length > 0 ? sameArea : routeReady.filter(c => c.cluster === cluster);
  const dayCounts = {};
  ROUTE_DAYS.forEach(d => {
    dayCounts[d] = 0;
  });
  comparisonSet.forEach(c => {
    dayCounts[c.day] = (dayCounts[c.day] || 0) + 1;
  });
  let bestDay = ROUTE_DAYS[0];
  let bestCount = -1;
  ROUTE_DAYS.forEach(d => {
    if (dayCounts[d] > bestCount) {
      bestCount = dayCounts[d];
      bestDay = d;
    }
  });
  const requestedValid = requestedDay && ROUTE_DAYS.includes(requestedDay);
  return {
    dayCounts,
    bestDay,
    bestCount,
    usedZip: usedZip && comparisonSet === sameArea,
    compareLabel: sameArea.length > 0 && zip ? `zip ${zip}` : cluster,
    requestedDay: requestedValid ? requestedDay : null,
    requestedDayCount: requestedValid ? dayCounts[requestedDay] : null,
    suggestedDay: requestedValid ? requestedDay : bestDay
  };
}
function statusColor(status) {
  switch (status) {
    case "active":
      return "#5C7A3E";
    case "as-needed":
      return "#B58A2C";
    case "pending":
      return "#2D6E5C";
    case "inactive":
      return "#8A7F6E";
    case "lost":
      return "#A65438";
    default:
      return "#8A7F6E";
  }
}

// ---------- MOWED STRIPE SIGNATURE ELEMENT ----------

function MowStripes({
  height = 64,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      height,
      background: "repeating-linear-gradient(115deg, #3E5C2C 0px, #3E5C2C 26px, #4A6B35 26px, #4A6B35 52px)"
    }
  });
}

// ---------- UI PRIMITIVES ----------

function Pill({
  children,
  color
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      padding: "3px 9px",
      borderRadius: 999,
      color: "#fff",
      background: color
    }
  }, children);
}
function Card({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FBF8F0",
      border: "1px solid #DDD3BC",
      borderRadius: 10,
      padding: 16,
      ...style
    }
  }, children);
}

// ---------- TABS ----------

const ALL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// ---------- PENDING PAYMENTS BANNER (anyone still owed, across all clients) ----------

async function collectPendingPayments(clients) {
  const items = [];
  let total = 0;
  for (const c of clients) {
    try {
      const r = await window.storage.get(`payment-log:${c.id}`, true);
      const log = r && r.value ? JSON.parse(r.value) : [];
      const pending = log.filter(e => e.paid === false);
      if (pending.length > 0) {
        const amount = pending.reduce((sum, e) => sum + (e.amount || 0), 0);
        items.push({
          id: c.id,
          name: c.name,
          amount,
          count: pending.length
        });
        total += amount;
      }
    } catch (e) {
      // skip unreadable log
    }
  }
  items.sort((a, b) => b.amount - a.amount);
  return {
    items,
    total
  };
}
function PendingPaymentsBanner({
  refreshTick
}) {
  const {
    clients
  } = useClients();
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    collectPendingPayments(clients).then(result => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [clients, refreshTick]);
  if (!data || data.items.length === 0) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px",
      borderRadius: 10,
      background: "#A32D2D",
      border: "1px solid #7A1F1F"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, "\uD83D\uDCB0 Pending payment", data.items.length === 1 ? "" : "s"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      fontSize: 13,
      color: "#fff"
    }
  }, fmt(data.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, data.items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    style: {
      fontSize: 12,
      color: "#FBE0E0",
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", null, it.name, it.count > 1 ? ` (${it.count} requests)` : ""), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, fmt(it.amount))))));
}

// ---------- RAIN ALERT (checks live conditions via Open-Meteo — free, no API key,
// CORS-friendly — for every zip with a client scheduled today) ----------

// Open-Meteo's current-conditions endpoint — no key, no signup, safe for direct browser
// calls. Returns rain in mm for the exact coordinates given.
async function getCurrentRain(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=rain,precipitation`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather request failed");
  const data = await res.json();
  const rain = data.current && (data.current.rain ?? data.current.precipitation);
  return typeof rain === "number" ? rain : 0;
}
async function collectTodaysRainAlerts(clients) {
  const {
    apiKey
  } = await getFuelSettings();
  if (!apiKey) return {
    available: false,
    alerts: []
  };
  const todayDayName = ALL_DAY_NAMES[new Date().getDay()];
  const todaysClients = (clients || []).filter(c => (c.status === "active" || c.status === "as-needed") && c.day === todayDayName && isDueThisWeek(c));
  if (todaysClients.length === 0) return {
    available: true,
    alerts: []
  };
  // Group by zip (falls back to city+state for anyone without one on file yet) so a
  // shared area only gets checked once, not once per client on that route.
  const groups = {};
  todaysClients.forEach(c => {
    const key = c.zip || `${c.cluster}, ${c.state || "OK"}`;
    if (!groups[key]) {
      groups[key] = {
        label: c.zip || c.cluster,
        clients: [],
        geocodeQuery: c.zip ? `${c.zip}, ${c.state || "OK"}` : `${c.cluster}, ${c.state || "OK"}`
      };
    }
    groups[key].clients.push(c.name);
  });
  const alerts = [];
  for (const key of Object.keys(groups)) {
    const group = groups[key];
    try {
      const coords = await geocodeAddress(apiKey, group.geocodeQuery);
      const rain = await getCurrentRain(coords.lat, coords.lng);
      if (rain > 0) {
        alerts.push({
          label: group.label,
          clients: group.clients,
          rain
        });
      }
    } catch (e) {
      // skip an area that fails to geocode or fetch weather — one bad lookup
      // shouldn't block the rest of today's route from being checked
    }
  }
  return {
    available: true,
    alerts
  };
}
function RainAlertBanner() {
  const {
    clients
  } = useClients();
  const [state, setState] = useState({
    available: true,
    alerts: []
  });
  useEffect(() => {
    let cancelled = false;
    collectTodaysRainAlerts(clients).then(result => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [clients]);
  if (!state.available || state.alerts.length === 0) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px",
      borderRadius: 10,
      background: "#E3EEF5",
      border: "1px solid #B9D4E3"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      color: "#2A2620",
      marginBottom: 6
    }
  }, "\uD83C\uDF27\uFE0F Raining now on today's route"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, state.alerts.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 12,
      color: "#1F5273"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, a.label), " — ", a.clients.join(", "), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      color: "#4A7A9B"
    }
  }, "(", a.rain.toFixed(1), "mm now)")))));
}
// Distinguishes requests that arrived since the owner last opened the Requests tab
// from ones they've already seen but haven't resolved yet — lets the Dashboard banner
// escalate to a red alert only for genuinely new arrivals, not a stale backlog.
async function getRequestAlertInfo() {
  let keys = [];
  try {
    const listResult = await window.storage.list("service-request:", true);
    keys = (listResult && listResult.keys) || [];
  } catch (e) {
    return {
      pendingCount: 0,
      newCount: 0
    };
  }
  let lastSeen = 0;
  try {
    const seenResult = await window.storage.get("requests-last-seen", true);
    if (seenResult && seenResult.value) lastSeen = new Date(seenResult.value).getTime();
  } catch (e) {
    // never seen before — everything pending counts as new
  }
  let pendingCount = 0;
  let newCount = 0;
  for (const key of keys) {
    try {
      const r = await window.storage.get(key, true);
      if (r && r.value) {
        const parsed = JSON.parse(r.value);
        if (parsed.status === "pending") {
          pendingCount++;
          if (parsed.submittedAt && new Date(parsed.submittedAt).getTime() > lastSeen) newCount++;
        }
      }
    } catch (e) {
      // skip unreadable entry
    }
  }
  return {
    pendingCount,
    newCount
  };
}
function NewRequestsBanner({
  onGoToRequests,
  refreshTick
}) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getRequestAlertInfo().then(result => {
      if (!cancelled) setInfo(result);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);
  if (!info || info.pendingCount === 0) return null;
  const isNew = info.newCount > 0;
  return /*#__PURE__*/React.createElement("button", {
    onClick: onGoToRequests,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: "12px 14px",
      borderRadius: 10,
      background: isNew ? "#A32D2D" : "#B5602F",
      color: "#fff",
      border: isNew ? "2px solid #E8817A" : "none",
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, isNew && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15
    }
  }, "\uD83D\uDEA8"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 14
    }
  }, isNew ? `${info.newCount} new quote request${info.newCount === 1 ? "" : "s"}!` : `${info.pendingCount} quote request${info.pendingCount === 1 ? "" : "s"} still pending`)), /*#__PURE__*/React.createElement(ChevronRight, {
    size: 16
  }));
}

// ---------- REQUESTS ALERT MODAL (replaces the old standalone Requests tab) ----------
// Approving a request adds the prospective customer straight into the client list under
// "pending" status, rather than a separate approval record — one system, not two.

function RequestsAlertModal({
  onClose,
  onResolved
}) {
  const {
    addClient,
    clients
  } = useClients();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [assignments, setAssignments] = useState({}); // requestId -> { cluster, zip, day }
  const [routeFits, setRouteFits] = useState({}); // requestId -> sorted [{day, minMiles, nearestName, stopCount}] | "loading" | "unavailable"
  const loadRequests = async () => {
    setError(null);
    let keys = [];
    try {
      const listResult = await window.storage.list("service-request:", true);
      keys = (listResult && listResult.keys) || [];
    } catch (e) {
      setRequests([]);
      return;
    }
    const loaded = [];
    for (const key of keys) {
      try {
        const r = await window.storage.get(key, true);
        if (r && r.value) loaded.push(JSON.parse(r.value));
      } catch (e) {
        // skip unreadable entry
      }
    }
    loaded.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    setRequests(loaded);
    setAssignments(prev => {
      const next = {
        ...prev
      };
      loaded.forEach(r => {
        if (!next[r.id]) {
          const guessedCluster = guessClusterFromAddress(r.address);
          const guessedZip = guessZipFromAddress(r.address);
          const suggestion = suggestBestDay({
            cluster: guessedCluster,
            zip: guessedZip
          }, r.requestedDay, clients);
          next[r.id] = {
            cluster: guessedCluster,
            zip: guessedZip,
            day: suggestion.suggestedDay
          };
        }
      });
      return next;
    });
    // Refine each new request's day suggestion using real geocoded distance to existing
    // stops, if a Maps API key is configured — falls back to the cluster guess otherwise.
    const { apiKey } = await getFuelSettings();
    for (const r of loaded) {
      if (r.status !== "pending" || routeFits[r.id]) continue;
      if (!apiKey || !r.address) {
        setRouteFits(prev => ({
          ...prev,
          [r.id]: "unavailable"
        }));
        continue;
      }
      setRouteFits(prev => ({
        ...prev,
        [r.id]: "loading"
      }));
      const guessedCluster = guessClusterFromAddress(r.address);
      const guessedZip = guessZipFromAddress(r.address);
      findBestRouteFit(apiKey, r.address, guessedCluster, clients, "OK", guessedZip).then(fits => {
        setRouteFits(prev => ({
          ...prev,
          [r.id]: fits
        }));
        const best = fits.find(f => f.minMiles !== Infinity);
        if (best && !r.requestedDay) {
          setAssignments(prev => ({
            ...prev,
            [r.id]: {
              ...prev[r.id],
              day: best.day
            }
          }));
        }
      }).catch(() => {
        setRouteFits(prev => ({
          ...prev,
          [r.id]: "unavailable"
        }));
      });
    }
  };
  const setAssignment = (id, key, value) => {
    setAssignments(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value
      }
    }));
  };
  useEffect(() => {
    loadRequests();
    window.storage.set("requests-last-seen", new Date().toISOString(), true).catch(() => {
      // best-effort — worst case the alert reappears next time, not critical
    });
  }, []);
  const handleDecline = async record => {
    setBusyId(record.id);
    try {
      const updated = {
        ...record,
        status: "declined"
      };
      const result = await window.storage.set(`service-request:${record.id}`, JSON.stringify(updated), true);
      if (!result) throw new Error("Storage failed");
      setRequests(prev => prev.map(r => r.id === record.id ? updated : r));
      if (onResolved) onResolved();
    } catch (e) {
      setError("Couldn't update that request — try again.");
    }
    setBusyId(null);
  };
  const handleApprove = async record => {
    setBusyId(record.id);
    setError(null);
    try {
      const assignment = assignments[record.id] || {
        cluster: "Edmond",
        day: "—"
      };
      const noteParts = [];
      if (record.services && record.services.length > 0) noteParts.push(record.services.join(", "));
      if (record.weedTypes && record.weedTypes.length > 0) noteParts.push(`Weeds noted: ${record.weedTypes.join(", ")}`);
      if (record.notes) noteParts.push(record.notes);
      await addClient({
        name: record.name,
        address: record.address || "",
        cluster: assignment.cluster,
        state: "OK",
        zip: assignment.zip || "",
        day: assignment.day,
        frequency: record.frequency || "Weekly",
        nextVisitDate: "",
        price: record.total ?? null,
        status: "pending",
        phone: record.phone || "",
        email: "",
        birthday: "",
        sqft: null,
        signupDate: localDateISO(),
        note: [record.requestedDay ? `Requested day: ${record.requestedDay}` : null, ...noteParts].filter(Boolean).join(" — ")
      });
      const updated = {
        ...record,
        status: "approved"
      };
      const result = await window.storage.set(`service-request:${record.id}`, JSON.stringify(updated), true);
      if (!result) throw new Error("Storage failed");
      setRequests(prev => prev.map(r => r.id === record.id ? updated : r));
      if (onResolved) onResolved();
    } catch (e) {
      setError("Couldn't approve that request — try again.");
    }
    setBusyId(null);
  };
  const pending = (requests || []).filter(r => r.status === "pending");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(42,38,32,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FBF8F0",
      borderRadius: 14,
      maxWidth: 420,
      width: "100%",
      maxHeight: "85vh",
      overflowY: "auto",
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 16,
      color: "#2A2620"
    }
  }, "New quote requests"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: "none",
      border: "none",
      fontSize: 20,
      color: "#8A7F6E",
      cursor: "pointer",
      lineHeight: 1
    }
  }, "\u00D7")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginBottom: 12
    }
  }, "Approving adds them to Clients under \u201Cpending\u201D status. Decline just clears the request."), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#A65438",
      marginBottom: 8
    }
  }, error), requests === null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#8A7F6E"
    }
  }, "Loading…") : pending.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#8A7F6E"
    }
  }, "Nothing waiting on approval.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, pending.map(r => /*#__PURE__*/React.createElement(Card, {
    key: r.id,
    style: {
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: "#2A2620"
    }
  }, r.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginTop: 2,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(MapPin, {
    size: 11
  }), " ", r.address), r.requestedDay && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#B58A2C",
      marginTop: 2,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Clock, {
    size: 11
  }), " Requested: ", r.requestedDay, " · ", r.frequency), r.services && r.services.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginTop: 6
    }
  }, r.services.join(", ")), r.weedTypes && r.weedTypes.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginTop: 4
    }
  }, "Weeds noted: ", r.weedTypes.join(", ")), r.notes && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginTop: 4,
      fontStyle: "italic"
    }
  }, "\"", r.notes, "\""), (() => {
    const assignment = assignments[r.id] || {
      cluster: "Edmond",
      zip: "",
      day: "—"
    };
    const suggestion = suggestBestDay({
      cluster: assignment.cluster,
      zip: assignment.zip
    }, r.requestedDay, clients);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        padding: 8,
        background: "#FBF3DE",
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: assignment.cluster,
      onChange: e => setAssignment(r.id, "cluster", e.target.value),
      style: {
        fontSize: 11,
        padding: "5px 6px",
        borderRadius: 5,
        border: "1px solid #DDD3BC"
      }
    }, CLUSTERS.map(c => /*#__PURE__*/React.createElement("option", {
      key: c,
      value: c
    }, c))), /*#__PURE__*/React.createElement("input", {
      value: assignment.zip,
      onChange: e => setAssignment(r.id, "zip", e.target.value),
      placeholder: "Zip",
      style: {
        fontSize: 11,
        padding: "5px 6px",
        borderRadius: 5,
        border: "1px solid #DDD3BC"
      }
    }), /*#__PURE__*/React.createElement("select", {
      value: assignment.day,
      onChange: e => setAssignment(r.id, "day", e.target.value),
      style: {
        fontSize: 11,
        padding: "5px 6px",
        borderRadius: 5,
        border: "1px solid #DDD3BC"
      }
    }, [...ROUTE_DAYS, "—"].map(d => /*#__PURE__*/React.createElement("option", {
      key: d,
      value: d
    }, d)))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#8A7F6E"
      }
    }, (() => {
      const fit = routeFits[r.id];
      if (fit === "loading") return "Checking real driving distance to your existing stops…";
      if (Array.isArray(fit)) {
        const chosen = fit.find(f => f.day === assignment.day);
        if (suggestion.requestedDay) {
          return chosen && chosen.minMiles !== Infinity ? `Requested ${suggestion.requestedDay} — closest existing stop is ${chosen.nearestName} (${chosen.minMiles.toFixed(1)} mi away).` : `Requested ${suggestion.requestedDay} — no other stops on this day yet to compare distance.`;
        }
        return chosen && chosen.minMiles !== Infinity ? `Suggested ${chosen.day} — closest to ${chosen.nearestName} (${chosen.minMiles.toFixed(1)} mi away), the nearest fit on your route.` : "No nearby stops found on any day — pick manually.";
      }
      // Maps key not configured, or geocoding unavailable — fall back to city-density guess
      return suggestion.requestedDay ? `Requested ${suggestion.requestedDay} — ${suggestion.requestedDayCount} other ${suggestion.compareLabel} client${suggestion.requestedDayCount === 1 ? "" : "s"} already on this day.` : suggestion.bestCount > 0 ? `Suggested ${suggestion.bestDay} — busiest ${suggestion.compareLabel} day (${suggestion.bestCount} client${suggestion.bestCount === 1 ? "" : "s"}). Add a Maps API key in Settings for real distance-based fitting.` : `No other ${suggestion.compareLabel} clients yet — pick any day.`;
    })()));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      color: "#B5602F"
    }
  }, fmt(r.total)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDecline(r),
    disabled: busyId === r.id,
    style: {
      padding: "6px 12px",
      borderRadius: 999,
      border: "1px solid #A65438",
      background: "#fff",
      color: "#A65438",
      fontSize: 12,
      cursor: "pointer"
    }
  }, "Decline"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleApprove(r),
    disabled: busyId === r.id,
    style: {
      padding: "6px 12px",
      borderRadius: 999,
      border: "none",
      background: "#5C7A3E",
      color: "#fff",
      fontSize: 12,
      cursor: "pointer"
    }
  }, busyId === r.id ? "…" : "Approve"))))))));
}

// ---------- BIRTHDAY / COMPLIMENTARY VISIT REMINDER ----------

function BirthdayCompBanner({
  clients
}) {
  const [dismissedKeys, setDismissedKeys] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [gates, setGates] = useState({}); // clientId -> "pending" | "confirmed"
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get("birthday-banner-dismissed", false);
        const parsed = result && result.value ? JSON.parse(result.value) : [];
        if (!cancelled) setDismissedKeys(parsed);
      } catch (e) {
        // nothing dismissed yet — fine
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const upcoming = (clients || []).filter(c => c.status === "active" || c.status === "as-needed" || c.status === "inactive" || c.status === "lost").map(c => {
    const bday = birthdayInfo(c.birthday);
    if (!bday) return null;
    const comp = complimentaryVisitInfo(c); // null if client has no active scheduled day (e.g. most inactive/lost clients)
    return {
      client: c,
      bday,
      comp
    };
  }).filter(x => x && x.bday.daysAway === 0);
  const dismissKeyFor = x => `${x.client.id}:${x.comp ? x.comp.compVisitISO : x.bday.label}`;
  const visible = upcoming.filter(x => !dismissedKeys.includes(dismissKeyFor(x)));
  // For lapsed clients with a live reminder, seed a "pending" gate the first time it's
  // seen so the payment button knows not to auto-comp them until explicitly confirmed.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lapsed = visible.filter(x => x.client.status === "inactive" || x.client.status === "lost");
      const entries = await Promise.all(lapsed.map(async x => {
        const existing = await getWinbackGate(x.client.id);
        if (!existing) {
          await setWinbackGate(x.client.id, "pending");
          return [x.client.id, "pending"];
        }
        return [x.client.id, existing];
      }));
      if (!cancelled) setGates(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [visible.map(x => x.client.id).join(",")]);
  if (visible.length === 0) return null;
  const handleDismiss = async key => {
    const next = [...dismissedKeys, key];
    setDismissedKeys(next);
    try {
      await window.storage.set("birthday-banner-dismissed", JSON.stringify(next), false);
    } catch (e) {
      // best-effort — dismissal not critical
    }
  };
  const handleCopy = async c => {
    const message = c.status === "lost" ? "Happiest of Birthdays from all of us at Mow Masters!  We provide all of our active clients a complimentary service for their birthdays!  We would love to see you back on the schedule, how best can we make that happen?" : "Happiest of Birthdays from Mow Masters!!  For your birthday, your next visit is complimentary!!";
    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      // clipboard unavailable — nothing further to do
    }
  };
  const handleConfirmReEnroll = async clientId => {
    await setWinbackGate(clientId, "confirmed");
    setGates(prev => ({
      ...prev,
      [clientId]: "confirmed"
    }));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, visible.map(({
    client: c,
    bday,
    comp
  }) => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      padding: "12px 14px",
      borderRadius: 10,
      background: "#FBF0DC",
      border: "1px solid #E9D9A8",
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 180,
      fontSize: 12,
      color: "#8A6A1C",
      lineHeight: 1.4
    }
  }, "\uD83C\uDF82 ", c.name, "'s birthday is ", bday.label, bday.daysAway === 0 ? " (today!)" : ` (${bday.daysAway}d away)`, comp ? ` — their ${comp.isToday ? "visit today" : `${comp.compVisitLabel} visit`} is complimentary.` : c.status === "lost" ? " — they're a lost client, but a birthday reach-out could win them back." : c.status === "inactive" ? gates[c.id] === "confirmed" ? " — re-enrolled ✓, their next scheduled visit will be complimentary." : " — inactive. Confirm they're back on a recurring schedule before their comp visit applies." : "."), (c.status === "inactive" || c.status === "lost") && /*#__PURE__*/React.createElement("button", {
    onClick: () => handleConfirmReEnroll(c.id),
    disabled: gates[c.id] === "confirmed",
    style: {
      padding: "6px 12px",
      borderRadius: 999,
      border: "none",
      background: gates[c.id] === "confirmed" ? "#5C7A3E" : "#3E5C2C",
      color: "#fff",
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 600,
      cursor: gates[c.id] === "confirmed" ? "default" : "pointer",
      opacity: gates[c.id] === "confirmed" ? 0.85 : 1
    }
  }, gates[c.id] === "confirmed" ? "Re-enrolled ✓" : "Confirm re-enrolled"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleCopy(c),
    style: {
      padding: "6px 12px",
      borderRadius: 999,
      border: "none",
      background: copiedId === c.id ? "#5C7A3E" : "#8A6A1C",
      color: "#fff",
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 600,
      cursor: "pointer"
    }
  }, copiedId === c.id ? "Copied ✓" : "Copy birthday message"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDismiss(dismissKeyFor({
      client: c,
      bday,
      comp
    })),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#8A6A1C",
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, "Got it"))));
}
// ---------- GAS PRICE REMINDER (Mon-Fri, once per day until entered) ----------

function GasPriceBanner() {
  const [price, setPrice] = useState(null);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const todayISO = localDateISO();
  const isWeekday = (() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5;
  })();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await getTodaysGasPrice();
      if (!cancelled) setPrice(existing);
    })();
    return () => {
      cancelled = true;
    };
  }, [todayISO]);
  if (!isWeekday || price != null) return null;
  const handleSave = async () => {
    const value = Number(input);
    if (!input || isNaN(value) || value <= 0) {
      setError("Enter a price like 2.95");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await window.storage.set(`gas-price:${todayISO}`, String(value), true);
      setPrice(value);
    } catch (e) {
      setError("Couldn't save — try again.");
    }
    setSaving(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px",
      borderRadius: 10,
      background: "#FBF0DC",
      border: "1px solid #E9D9A8",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8A6A1C"
    }
  }, "\u26FD What's gas running today? Used to calculate fuel cost per route."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    min: "0",
    placeholder: "$2.95",
    value: input,
    onChange: e => setInput(e.target.value),
    style: {
      flex: 1,
      padding: "7px 10px",
      borderRadius: 6,
      border: "1px solid #DDD3BC",
      fontSize: 13,
      fontFamily: "'JetBrains Mono', monospace",
      background: "#fff"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    disabled: saving,
    style: {
      padding: "8px 14px",
      borderRadius: 999,
      border: "none",
      background: "#8A6A1C",
      color: "#fff",
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 600,
      cursor: saving ? "default" : "pointer",
      opacity: saving ? 0.6 : 1
    }
  }, saving ? "Saving…" : "Save")), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438"
    }
  }, error));
}
function BackupReminderBanner({
  todaysClients
}) {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);
  const [exporting, setExporting] = useState(false);
  const {
    clients
  } = useClients();
  const todayISO = localDateISO();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!todaysClients || todaysClients.length === 0) {
        if (!cancelled) setReady(false);
        return;
      }
      try {
        const results = await Promise.all(todaysClients.map(async c => {
          const result = await window.storage.get(`timer-log:${c.id}`, true);
          const log = result && result.value ? JSON.parse(result.value) : [];
          return log.length > 0 && log[0].date === todayISO;
        }));
        const allDone = results.every(Boolean);
        let dismissedFlag = false;
        try {
          const dismissResult = await window.storage.get(`backup-banner-dismissed:${todayISO}`, false);
          dismissedFlag = !!(dismissResult && dismissResult.value);
        } catch (e) {
          // no dismissal recorded — fine
        }
        let backupStamp = null;
        try {
          const backupResult = await window.storage.get("last-backup-date", false);
          backupStamp = backupResult && backupResult.value ? backupResult.value : null;
        } catch (e) {
          // no backup recorded yet — fine
        }
        if (!cancelled) {
          setReady(allDone);
          setDismissed(dismissedFlag);
          setLastBackup(backupStamp);
        }
      } catch (e) {
        // best-effort check — no banner if it fails
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [todaysClients ? todaysClients.map(c => c.id).join(",") : "", todayISO]);
  if (!ready || dismissed || lastBackup === todayISO) return null;
  const handleBackup = async () => {
    setExporting(true);
    try {
      const stamp = await exportAllData(clients);
      setLastBackup(stamp);
    } catch (e) {
      // leave banner up so they can retry
    }
    setExporting(false);
  };
  const handleDismiss = async () => {
    setDismissed(true);
    try {
      await window.storage.set(`backup-banner-dismissed:${todayISO}`, "1", false);
    } catch (e) {
      // dismissal is best-effort, not critical
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px",
      borderRadius: 10,
      background: "#EAF0E1",
      border: "1px solid #C9D9B8",
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 160,
      fontSize: 12,
      color: "#3E5C2C",
      lineHeight: 1.4
    }
  }, "Today's last visit is logged. Back up your data?"), /*#__PURE__*/React.createElement("button", {
    onClick: handleBackup,
    disabled: exporting,
    style: {
      padding: "7px 14px",
      borderRadius: 999,
      border: "none",
      background: "#3E5C2C",
      color: "#fff",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      fontWeight: 600,
      cursor: exporting ? "default" : "pointer",
      opacity: exporting ? 0.6 : 1
    }
  }, exporting ? "Backing up…" : "Back up now"), /*#__PURE__*/React.createElement("button", {
    onClick: handleDismiss,
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#5C7A3E",
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, "Not now"));
}
// ---------- SEND QUOTE (copies a link to the public quote page for a prospect) ----------

function SendQuoteButton() {
  const [copied, setCopied] = useState(false);
  const [shortening, setShortening] = useState(false);
  const [error, setError] = useState(null);
  const handleClick = async () => {
    setError(null);
    setShortening(true);
    const longLink = `${window.location.origin}${window.location.pathname}#quote`;
    let linkToUse = longLink;
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longLink)}`);
      if (res.ok) {
        const short = (await res.text()).trim();
        if (short.startsWith("http")) linkToUse = short;
      }
    } catch (e) {
      // shortening service unreachable — fall back to the full link below, still works
    }
    setShortening(false);
    try {
      await navigator.clipboard.writeText(`Get a Free Estimate: ${linkToUse}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Couldn't copy — link is " + linkToUse);
    }
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleClick,
    disabled: shortening,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      flex: 1,
      padding: "10px 14px",
      borderRadius: 10,
      border: "none",
      cursor: shortening ? "default" : "pointer",
      background: copied ? "#5C7A3E" : "#8A6A1C",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      opacity: shortening ? 0.7 : 1
    }
  }, /*#__PURE__*/React.createElement(Star, {
    size: 14
  }), shortening ? "Getting link…" : copied ? "Copied ✓" : "Send Quote"),
  // Opens the customer quote form right here, for filling one out on the spot
  // (e.g. standing in a prospect's yard) rather than texting them a link.
  /*#__PURE__*/React.createElement("a", {
    href: `${window.location.origin}${window.location.pathname}#quote`,
    target: "_blank",
    rel: "noopener noreferrer",
    title: "Open the quote form to fill out yourself",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      flex: 1,
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid #8A6A1C",
      background: "#fff",
      color: "#8A6A1C",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      textDecoration: "none",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement(Pencil, {
    size: 14
  }), "Fill Out Quote")), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438",
      marginTop: 4
    }
  }, error));
}

// ---------- ADD REFERRAL (new client + 20% off the referrer's next bill) ----------

function AddReferralButton() {
  const {
    clients,
    addClient,
    updateClient
  } = useClients();
  const [open, setOpen] = useState(false);
  const [referrerId, setReferrerId] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    cluster: "Edmond",
    state: "OK",
    zip: "",
    day: "",
    frequency: "Weekly",
    price: "",
    phone: ""
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm(prev => ({
    ...prev,
    [k]: v
  }));
  // Anyone currently on the books can be credited with a referral.
  const eligibleReferrers = (clients || []).filter(c => c.status === "active" || c.status === "as-needed").sort((a, b) => a.name.localeCompare(b.name));
  const referrer = eligibleReferrers.find(c => c.id === referrerId) || null;
  const reset = () => {
    setForm({
      name: "",
      address: "",
      cluster: "Edmond",
      state: "OK",
      zip: "",
      day: "",
      frequency: "Weekly",
      price: "",
      phone: ""
    });
    setReferrerId("");
    setError(null);
  };
  const handleSave = async () => {
    if (!form.name || !form.address) {
      setError("Name and address are required.");
      return;
    }
    if (!referrerId) {
      setError("Pick who referred them.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const suggestedDay = form.day || suggestBestDay({
        cluster: form.cluster,
        zip: form.zip
      }, null, clients).suggestedDay;
      await addClient({
        name: form.name,
        address: form.address,
        cluster: form.cluster,
        state: form.state,
        zip: form.zip,
        day: suggestedDay,
        frequency: form.frequency,
        nextVisitDate: "",
        price: form.price ? Number(form.price) : null,
        status: "active",
        phone: form.phone,
        sqft: null,
        signupDate: localDateISO(),
        note: `Referred by ${referrer.name}`,
        // The referrer isn't discounted yet — this marks who to credit once this
        // client's first visit is actually completed (their first timer stop).
        pendingReferrerId: referrer.id
      });
      // Thank-you message for the referrer, ready to paste.
      const thankYou = `Hi ${referrer.name.split(" ")[0]}, thank you so much for referring ${form.name.split(" ")[0]} to Mow Masters of Edmond — that means a lot! Once we complete their first visit, I'll apply a 20% discount to your next service. We really appreciate you spreading the word!`;
      try {
        await navigator.clipboard.writeText(thankYou);
      } catch (e) {
        // clipboard unavailable — the discount and client are still saved
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
        reset();
      }, 2500);
    } catch (e) {
      setError("Couldn't save — try again.");
    }
    setSaving(false);
  };
  const inputStyle = {
    width: "100%",
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid #DDD3BC",
    fontSize: 13,
    fontFamily: "inherit",
    background: "#fff",
    color: "#2A2620",
    boxSizing: "border-box"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setOpen(o => !o);
      setError(null);
    },
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      width: "100%",
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid #5C7A3E",
      background: open ? "#EAF0E1" : "#fff",
      color: "#3E5C2C",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Users, {
    size: 14
  }), open ? "Close" : "Add Referral"), open && /*#__PURE__*/React.createElement(Card, {
    style: {
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E"
    }
  }, "Referred by"), /*#__PURE__*/React.createElement("select", {
    value: referrerId,
    onChange: e => setReferrerId(e.target.value),
    style: inputStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select who referred them…"), eligibleReferrers.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name))), referrer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      borderRadius: 6,
      background: "#FBF3DE",
      border: "1px solid #E9D9A8",
      fontSize: 11,
      color: "#8A6A1C"
    }
  }, "\uD83C\uDF81 ", referrer.name, " gets 20% off their next bill once this client is saved."), /*#__PURE__*/React.createElement("input", {
    placeholder: "New client name",
    value: form.name,
    onChange: e => set("name", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Address",
    value: form.address,
    onChange: e => set("address", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.cluster,
    onChange: e => set("cluster", e.target.value),
    style: inputStyle
  }, CLUSTERS.map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c))), /*#__PURE__*/React.createElement("input", {
    placeholder: "Zip",
    value: form.zip,
    onChange: e => set("zip", e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.day,
    onChange: e => set("day", e.target.value),
    style: inputStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Auto-pick best day"), ROUTE_DAYS.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d))), /*#__PURE__*/React.createElement("select", {
    value: form.frequency,
    onChange: e => set("frequency", e.target.value),
    style: inputStyle
  }, SERVICE_INTERVALS.map(f => /*#__PURE__*/React.createElement("option", {
    key: f,
    value: f
  }, f)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Price per visit ($)",
    type: "number",
    value: form.price,
    onChange: e => set("price", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Phone (optional)",
    value: form.phone,
    onChange: e => set("phone", e.target.value),
    style: inputStyle
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438"
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    disabled: saving,
    style: {
      width: "100%",
      padding: "10px",
      borderRadius: 8,
      border: "none",
      background: saved ? "#5C7A3E" : "#3E5C2C",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      cursor: saving ? "default" : "pointer",
      opacity: saving ? 0.6 : 1
    }
  }, saving ? "Saving…" : saved ? "Saved ✓ — thank-you message copied" : "Save referral & copy thank-you")));
}
function Dashboard({
  onRequestsChanged
}) {
  const {
    clients,
    loading
  } = useClients();
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [requestsRefreshTick, setRequestsRefreshTick] = useState(0);
  const [paymentsRefreshTick, setPaymentsRefreshTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getRequestAlertInfo().then(info => {
      if (!cancelled && info.pendingCount > 0) setShowRequestsModal(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const today = ROUTE_DAYS[new Date().getDay() - 1] || null;
  if (loading) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      color: "#8A7F6E",
      fontSize: 13
    }
  }, "Loading…");
  const todaysClients = today ? clientsForDay(clients, today) : [];
  const weekTotal = ROUTE_DAYS.reduce((sum, d) => sum + dayRevenue(clients, d), 0);
  const goalGap = GOAL_PER_DAY * ROUTE_DAYS.length - weekTotal;
  const activeClients = clients.filter(c => c.status === "active");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      overflow: "hidden",
      border: "1px solid #DDD3BC"
    }
  }, /*#__PURE__*/React.createElement(MowStripes, {
    height: 54
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#2D4222",
      padding: "18px 20px",
      color: "#F2EDDD"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontSize: 22,
      fontWeight: 700
    }
  }, today ? `${today}'s Route` : "No route today"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
      opacity: 0.85,
      marginTop: 4
    }
  }, todaysClients.length, " stop", todaysClients.length === 1 ? "" : "s", " · ", fmt(dayRevenue(clients, today)), " scheduled"))), /*#__PURE__*/React.createElement(SendQuoteButton, null), /*#__PURE__*/React.createElement(AddReferralButton, null), /*#__PURE__*/React.createElement(GasPriceBanner, null), /*#__PURE__*/React.createElement(BirthdayCompBanner, {
    clients: clients
  }), /*#__PURE__*/React.createElement(BackupReminderBanner, {
    todaysClients: todaysClients
  }), /*#__PURE__*/React.createElement(NewRequestsBanner, {
    onGoToRequests: () => setShowRequestsModal(true),
    refreshTick: requestsRefreshTick
  }), /*#__PURE__*/React.createElement(PendingPaymentsBanner, {
    refreshTick: paymentsRefreshTick
  }), /*#__PURE__*/React.createElement(RainAlertBanner, null), showRequestsModal && /*#__PURE__*/React.createElement(RequestsAlertModal, {
    onClose: () => setShowRequestsModal(false),
    onResolved: () => {
      setRequestsRefreshTick(t => t + 1);
      if (onRequestsChanged) onRequestsChanged();
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#5C7A3E"
    }
  }, /*#__PURE__*/React.createElement(TrendingUp, {
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }
  }, "Week total")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontSize: 28,
      fontWeight: 700,
      color: "#2A2620",
      marginTop: 4
    }
  }, fmt(weekTotal)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8A7F6E",
      marginTop: 2
    }
  }, goalGap > 0 ? `${fmt(goalGap)} short of $${GOAL_PER_DAY}/day × ${ROUTE_DAYS.length}d goal` : "Goal met this week")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#B5602F"
    }
  }, /*#__PURE__*/React.createElement(Users, {
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }
  }, "Active clients")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontSize: 28,
      fontWeight: 700,
      color: "#2A2620",
      marginTop: 4
    }
  }, activeClients.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8A7F6E",
      marginTop: 2
    }
  }, "+", clients.filter(c => c.status === "as-needed").length, " as-needed"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 8,
      color: "#2A2620"
    }
  }, "Revenue by day"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, ROUTE_DAYS.map(d => {
    const rev = dayRevenue(clients, d);
    const pct = Math.min(100, rev / GOAL_PER_DAY * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 66,
        fontSize: 12,
        color: "#5C5346",
        fontFamily: "'JetBrains Mono', monospace"
      }
    }, d.slice(0, 3)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 10,
        background: "#E9E1CC",
        borderRadius: 6,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct}%`,
        height: "100%",
        background: pct >= 100 ? "#5C7A3E" : "#B58A2C"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 54,
        textAlign: "right",
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
        color: "#2A2620"
      }
    }, fmt(rev)));
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 8,
      color: "#2A2620"
    }
  }, "This week's schedule"), /*#__PURE__*/React.createElement(WeekAccordion, {
    onPaymentsChanged: () => setPaymentsRefreshTick(t => t + 1)
  })));
}
const HOME_BASE = "417 Pacific Crest Trl, Edmond, OK 73003";
function buildRouteURL(stops) {
  if (stops.length === 0) return null;
  const addr = c => encodeURIComponent(fullAddressFor(c.address, c.cluster, c.state, c.zip));
  const destination = addr(stops[stops.length - 1]);
  const waypoints = stops.slice(0, -1).map(addr).join("|");
  let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(HOME_BASE)}&destination=${destination}&travelmode=driving`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}
// ---------- FUEL & MILEAGE (Google Maps JS API, loaded on demand with the stored key) ----------

let mapsLoaderPromise = null;
function loadGoogleMaps(apiKey) {
  if (window.google && window.google.maps && window.google.maps.DirectionsService) {
    return Promise.resolve();
  }
  if (mapsLoaderPromise) return mapsLoaderPromise;
  mapsLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=routes`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      mapsLoaderPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });
  return mapsLoaderPromise;
}
async function getFuelSettings() {
  const [keyResult, mpgResult] = await Promise.all([window.storage.get("gmaps-api-key", true).catch(() => null), window.storage.get("vehicle-mpg", true).catch(() => null)]);
  return {
    apiKey: keyResult && keyResult.value ? keyResult.value : "",
    mpg: mpgResult && mpgResult.value ? Number(mpgResult.value) : 17
  };
}
async function getTodaysGasPrice() {
  const todayISO = localDateISO();
  try {
    const result = await window.storage.get(`gas-price:${todayISO}`, true);
    return result && result.value ? Number(result.value) : null;
  } catch (e) {
    return null;
  }
}
// Round-trip driving distance for a day's stops (home -> stop1 -> ... -> stopN -> home),
// via the Maps JS DirectionsService (browser-safe — the classic REST Directions/Distance
// Matrix endpoints block direct browser fetches with CORS, but the JS SDK is built for this).
function getRouteMiles(apiKey, stops) {
  return loadGoogleMaps(apiKey).then(() => new Promise((resolve, reject) => {
    const svc = new window.google.maps.DirectionsService();
    const waypoints = stops.map(c => ({
      location: fullAddressFor(c.address, c.cluster, c.state, c.zip),
      stopover: true
    }));
    svc.route({
      origin: HOME_BASE,
      destination: HOME_BASE,
      waypoints,
      optimizeWaypoints: false,
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status !== "OK" || !result.routes[0]) {
        reject(new Error(`Directions request failed: ${status}`));
        return;
      }
      const meters = result.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
      const seconds = result.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0);
      resolve({
        miles: meters / 1609.344,
        driveMinutes: Math.round(seconds / 60)
      });
    });
  }));
}
// Best available estimate of how long a visit actually takes: real logged average once
// there's history, falling back to the client's manually-set estimate before that exists.
async function getStopEstimatedMinutes(client) {
  try {
    const result = await window.storage.get(`timer-log:${client.id}`, true);
    const log = result && result.value ? JSON.parse(result.value) : [];
    if (log.length > 0) return avgDuration(log);
  } catch (e) {
    // no log yet — fall through to the manual estimate
  }
  return client.duration ?? null;
}
function formatMinutesAsHM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
// ---------- ROUTE FIT (real geocoded proximity — which day's route this address is
// actually closest to, not just which city bucket it falls in) ----------

// Caches geocoded lat/lng per address string so repeat lookups (existing clients don't
// move) don't burn API quota — keyed by the exact address text used for geocoding.
async function geocodeAddress(apiKey, address) {
  const cacheKey = `geocode:${address}`;
  try {
    const cached = await window.storage.get(cacheKey, false);
    if (cached && cached.value) return JSON.parse(cached.value);
  } catch (e) {
    // not cached yet — geocode below
  }
  await loadGoogleMaps(apiKey);
  const coords = await new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({
      address
    }, (results, status) => {
      if (status !== "OK" || !results[0]) {
        reject(new Error(`Geocoding failed: ${status}`));
        return;
      }
      const loc = results[0].geometry.location;
      resolve({
        lat: loc.lat(),
        lng: loc.lng()
      });
    });
  });
  window.storage.set(cacheKey, JSON.stringify(coords), false).catch(() => {
    // best-effort cache write — not critical if it fails
  });
  return coords;
}
function haversineMiles(a, b) {
  const rad = Math.PI / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const lat1 = a.lat * rad;
  const lat2 = b.lat * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
// Real proximity-based day fit: geocodes the candidate address and every existing
// active/as-needed stop, then ranks each weekday by distance to its closest stop —
// slotting the new client onto whichever route it's actually nearest to, not just
// whichever city bucket it falls in.
// Builds the most precise address string available for geocoding — zip is far more
// accurate than a city name alone, since one city can span several zips.
function fullAddressFor(address, cluster, state, zip) {
  return zip ? `${address}, ${cluster}, ${state || "OK"} ${zip}` : `${address}, ${cluster}, ${state || "OK"}`;
}
async function findBestRouteFit(apiKey, address, cluster, clients, state, zip) {
  const fullAddress = fullAddressFor(address, cluster, state, zip);
  const target = await geocodeAddress(apiKey, fullAddress);
  const routeReady = (clients || []).filter(c => (c.status === "active" || c.status === "as-needed") && c.day && ROUTE_DAYS.includes(c.day) && c.address);
  const results = await Promise.all(ROUTE_DAYS.map(async day => {
    const stops = routeReady.filter(c => c.day === day);
    if (stops.length === 0) {
      return {
        day,
        minMiles: Infinity,
        nearestName: null,
        stopCount: 0
      };
    }
    let minMiles = Infinity;
    let nearestName = null;
    for (const c of stops) {
      try {
        const coords = await geocodeAddress(apiKey, fullAddressFor(c.address, c.cluster, c.state, c.zip));
        const miles = haversineMiles(target, coords);
        if (miles < minMiles) {
          minMiles = miles;
          nearestName = c.name;
        }
      } catch (e) {
        // skip a stop that fails to geocode — don't let one bad address break the whole comparison
      }
    }
    return {
      day,
      minMiles,
      nearestName,
      stopCount: stops.length
    };
  }));
  results.sort((a, b) => a.minMiles - b.minMiles);
  return results;
}
function RouteFuelEstimate({
  day,
  stops
}) {
  const [routeData, setRouteData] = useState(null); // { miles, driveMinutes }
  const [mowMinutes, setMowMinutes] = useState(null);
  const [settings, setSettings] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [error, setError] = useState(null);
  const cacheKey = `route-miles:${day}`;
  const stopIds = stops.map(c => c.id).join(",");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fuelSettings = await getFuelSettings();
      const price = await getTodaysGasPrice();
      if (cancelled) return;
      setSettings(fuelSettings);
      setGasPrice(price);
      // Total mow time doesn't need the Maps key — sum whatever real/estimated durations
      // exist for each stop regardless of whether route mileage is available.
      const perStopMinutes = await Promise.all(stops.map(getStopEstimatedMinutes));
      if (!cancelled) {
        const known = perStopMinutes.filter(m => m != null);
        setMowMinutes(known.length > 0 ? known.reduce((a, b) => a + b, 0) : null);
      }
      if (!fuelSettings.apiKey || stops.length === 0) return;
      try {
        const cached = await window.storage.get(cacheKey, false);
        const parsed = cached && cached.value ? JSON.parse(cached.value) : null;
        if (parsed && parsed.stopIds === stopIds && parsed.driveMinutes != null) {
          if (!cancelled) setRouteData(parsed);
          return;
        }
      } catch (e) {
        // no cache — fetch fresh below
      }
      try {
        const result = await getRouteMiles(fuelSettings.apiKey, stops);
        if (cancelled) return;
        setRouteData(result);
        await window.storage.set(cacheKey, JSON.stringify({
          stopIds,
          miles: result.miles,
          driveMinutes: result.driveMinutes
        }), false);
      } catch (e) {
        if (!cancelled) setError("Couldn't calculate mileage — check the Maps API key in Settings.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [day, stopIds]);
  if (stops.length === 0 || !settings) return null;
  const totalMinutes = (mowMinutes || 0) + (routeData ? routeData.driveMinutes : 0);
  const showTotal = mowMinutes != null || routeData;
  if (!settings.apiKey) {
    // No Maps key configured — still show total mow time alone, since that part
    // doesn't depend on the key at all.
    return mowMinutes != null ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#5C5346",
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: "center",
        padding: "4px 0"
      }
    }, "\u2248 ", formatMinutesAsHM(mowMinutes), " total mowing time (add a Maps key in Settings for drive time too)") : null;
  }
  if (error) return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438",
      textAlign: "center",
      padding: "4px 0"
    }
  }, error);
  if (!routeData) return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      textAlign: "center",
      padding: "4px 0"
    }
  }, "Calculating mileage…");
  const fuelCost = gasPrice ? routeData.miles / settings.mpg * gasPrice : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#5C5346",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      padding: "4px 0",
      lineHeight: 1.5
    }
  }, showTotal && /*#__PURE__*/React.createElement("div", null, "\u2248 ", formatMinutesAsHM(totalMinutes), " total", mowMinutes != null ? ` (${formatMinutesAsHM(mowMinutes)} mowing + ${formatMinutesAsHM(routeData.driveMinutes)} driving)` : ` (${formatMinutesAsHM(routeData.driveMinutes)} driving — no mow-time history yet)`), /*#__PURE__*/React.createElement("div", null, "\u2248 ", routeData.miles.toFixed(1), " mi round trip", fuelCost != null ? ` · $${fuelCost.toFixed(2)} in fuel (5.3L V8 @ ${settings.mpg}mpg, $${gasPrice.toFixed(2)}/gal)` : " · add today's gas price on Dashboard for fuel cost"));
}
function buildWazeStopURL(client) {
  return `https://waze.com/ul?q=${encodeURIComponent(fullAddressFor(client.address, client.cluster, client.state, client.zip))}&navigate=yes`;
}
// MeasureLawn.com's lawn calculator takes a full address as a query param — includes
// ", USA" to match the exact format their site expects.
function buildMeasureLawnURL(client) {
  const address = `${fullAddressFor(client.address, client.cluster, client.state, client.zip)}, USA`;
  return `https://measurelawn.com/lawn-calculator?address=${encodeURIComponent(address)}`;
}
// One-time global keyframes injection — this app has no external stylesheet, so the
// pulse animation used by the "due now" badge state needs to be added to the page once.
if (typeof document !== "undefined" && !document.getElementById("pulse-badge-keyframes")) {
  const styleTag = document.createElement("style");
  styleTag.id = "pulse-badge-keyframes";
  styleTag.textContent = "@keyframes pulse-badge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }";
  document.head.appendChild(styleTag);
}
// ---------- RESCHEDULE / SKIP (one-off exceptions that never disturb the recurring
// interval — a skipped or moved visit affects only that single occurrence) ----------

function RescheduleButton({
  client,
  onChanged
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | "reschedule" | "skip"
  const [newDate, setNewDate] = useState("");
  const [overrides, setOverrides] = useState({
    skips: [],
    moves: {}
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // The accordion's day wrapper uses overflow:hidden for its rounded corners, which
  // clips any absolutely-positioned menu that extends past the card. Measuring the
  // button and rendering the menu with position:fixed escapes that clipping entirely.
  const btnRef = useRef(null);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0
  });
  useEffect(() => {
    let cancelled = false;
    loadVisitOverrides(client.id).then(loaded => {
      if (!cancelled) setOverrides(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [client.id]);
  const nextDate = nextOccurrence(client);
  const nextISO = nextDate ? localDateISO(nextDate) : null;
  const toggleMenu = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 210;
      const menuHeight = 150;
      // Prefer opening upward (these buttons sit low in the card); flip down only if
      // there isn't room above. Clamp horizontally so it never runs off-screen.
      const openUpward = rect.top > menuHeight + 10;
      const top = openUpward ? rect.top - menuHeight - 6 : rect.bottom + 6;
      let left = rect.right - menuWidth;
      if (left < 8) left = 8;
      const maxLeft = window.innerWidth - menuWidth - 8;
      if (left > maxLeft) left = Math.max(8, maxLeft);
      setMenuPos({
        top,
        left
      });
    }
    setMenuOpen(o => !o);
    setMode(null);
    setError(null);
  };
  const handleSkip = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!nextISO) return;
    setSaving(true);
    setError(null);
    try {
      const updated = {
        skips: [...overrides.skips, nextISO],
        moves: {
          ...overrides.moves
        }
      };
      await saveVisitOverrides(client.id, updated);
      setOverrides(updated);
      setMenuOpen(false);
      setMode(null);
      if (onChanged) onChanged();
    } catch (err) {
      setError("Couldn't save — try again.");
    }
    setSaving(false);
  };
  const handleReschedule = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!nextISO || !newDate) {
      setError("Pick a date first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = {
        skips: [...overrides.skips],
        moves: {
          ...overrides.moves,
          [nextISO]: newDate
        }
      };
      await saveVisitOverrides(client.id, updated);
      setOverrides(updated);
      setMenuOpen(false);
      setMode(null);
      setNewDate("");
      if (onChanged) onChanged();
    } catch (err) {
      setError("Couldn't save — try again.");
    }
    setSaving(false);
  };
  const handleUndo = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!nextISO) return;
    setSaving(true);
    setError(null);
    try {
      const movesCopy = {
        ...overrides.moves
      };
      // Clear an override on this date whether it was a skip or a move, and also
      // clear any move that landed *on* this date from another day.
      Object.keys(movesCopy).forEach(from => {
        if (from === nextISO || movesCopy[from] === nextISO) delete movesCopy[from];
      });
      const updated = {
        skips: overrides.skips.filter(s => s !== nextISO),
        moves: movesCopy
      };
      await saveVisitOverrides(client.id, updated);
      setOverrides(updated);
      setMenuOpen(false);
      setMode(null);
      if (onChanged) onChanged();
    } catch (err) {
      setError("Couldn't save — try again.");
    }
    setSaving(false);
  };
  // Any override touching upcoming dates means there's something to undo.
  const hasUpcomingOverride = overrides.skips.some(s => s >= localDateISO()) || Object.keys(overrides.moves).some(from => from >= localDateISO() || overrides.moves[from] >= localDateISO());
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      width: 52
    }
  }, /*#__PURE__*/React.createElement("button", {
    ref: btnRef,
    onClick: toggleMenu,
    title: nextDate ? `Next visit ${nextDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })} — tap to reschedule or skip` : "Reschedule or skip a visit",
    "aria-label": "Reschedule or skip visit",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 32,
      height: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "#8A6A1C",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Clock, {
    size: 15,
    color: "#fff"
  })), hasUpcomingOverride && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -3,
      right: -3,
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: "2px solid #FBF8F0",
      background: "#B5602F",
      color: "#fff",
      fontSize: 8,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1
    }
  }, "\u21BB")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, "Resched")), menuOpen && /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(false);
      setMode(null);
      setError(null);
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 190
    }
  }), menuOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: menuPos.top,
      left: menuPos.left,
      zIndex: 200,
      background: "#fff",
      border: "1px solid #DDD3BC",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      width: 210,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      fontSize: 10,
      color: "#8A7F6E",
      borderBottom: "1px solid #E9E1CC",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, nextDate ? `Next visit: ${nextDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  })}` : "No upcoming visit scheduled"), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(false);
      setMode(null);
      setError(null);
    },
    "aria-label": "Close",
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: "#8A7F6E",
      fontSize: 15,
      lineHeight: 1,
      flexShrink: 0
    }
  }, "\u00D7")), mode === "reschedule" ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#8A7F6E",
      marginBottom: 4
    }
  }, "Move this visit to:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: newDate,
    onChange: e => setNewDate(e.target.value),
    style: {
      width: "100%",
      padding: "6px 8px",
      borderRadius: 6,
      border: "1px solid #DDD3BC",
      fontSize: 12,
      boxSizing: "border-box",
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleReschedule,
    disabled: saving,
    style: {
      width: "100%",
      padding: "8px",
      borderRadius: 6,
      border: "none",
      background: "#5C7A3E",
      color: "#fff",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, saving ? "Saving…" : "Confirm new date")) : /*#__PURE__*/React.createElement("div", null, nextISO && /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setMode("reschedule");
      setNewDate(nextISO);
    },
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderBottom: "1px solid #E9E1CC",
      background: "#fff",
      cursor: "pointer",
      fontSize: 12,
      color: "#2A2620"
    }
  }, "Reschedule — pick a date"), nextISO && /*#__PURE__*/React.createElement("button", {
    onClick: handleSkip,
    disabled: saving,
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderBottom: hasUpcomingOverride ? "1px solid #E9E1CC" : "none",
      background: "#fff",
      cursor: "pointer",
      fontSize: 12,
      color: "#B5602F"
    }
  }, "Skip this visit only"), hasUpcomingOverride && /*#__PURE__*/React.createElement("button", {
    onClick: handleUndo,
    disabled: saving,
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      border: "none",
      background: "#fff",
      cursor: "pointer",
      fontSize: 12,
      color: "#8A7F6E"
    }
  }, "Undo change for this visit")), error && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 10px",
      fontSize: 10,
      color: "#A65438"
    }
  }, error)));
}
function MeasureLawnButton({
  client,
  refreshTick
}) {
  const {
    updateClient
  } = useClients();
  const [upcoming, setUpcoming] = useState(undefined); // undefined = loading, null = nothing due
  const [status, setStatus] = useState(null); // null | "sent" | "pending" | "quoted" | "declined"
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [error, setError] = useState(null);
  // Same clipping problem as RescheduleButton — the accordion wrapper's overflow:hidden
  // would cut this menu off, so it's measured and rendered with position:fixed.
  const btnRef = useRef(null);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0
  });
  // Outreach state is tracked per client + month/year cycle, so last year's declined
  // September doesn't suppress this year's, and each month starts fresh.
  const outreachKey = upcoming ? `lawn-plan-outreach:${client.id}:${upcoming.month}-${upcoming.year}` : null;
  const loadAll = async () => {
    try {
      const [planResult, declinesResult, soldResult] = await Promise.all([window.storage.get(`lawn-plan:${client.id}`, true), window.storage.get(`lawn-plan-declines:${client.id}`, true).catch(() => null), window.storage.get(`lawn-plan-sold:${client.id}`, true).catch(() => null)]);
      const plan = planResult && planResult.value ? JSON.parse(planResult.value) : null;
      const declines = declinesResult && declinesResult.value ? JSON.parse(declinesResult.value) : [];
      const sold = soldResult && soldResult.value ? JSON.parse(soldResult.value) : [];
      // Both declined and sold months drop out — a sold month's work is booked, so the
      // badge should roll forward to whatever's coming up next instead of lingering.
      const excludedKeys = [...declines.map(d => `${d.month}-${d.year}`), ...sold.map(s => `${s.month}-${s.year}`)];
      const next = getUpcomingLawnPlanTasks(plan, 45, new Date(), excludedKeys);
      setUpcoming(next);
      if (next) {
        try {
          const statusResult = await window.storage.get(`lawn-plan-outreach:${client.id}:${next.month}-${next.year}`, true);
          setStatus(statusResult && statusResult.value ? JSON.parse(statusResult.value).status : null);
        } catch (e) {
          setStatus(null);
        }
      } else {
        setStatus(null);
      }
    } catch (e) {
      setUpcoming(null);
    }
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadAll();
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id, refreshTick]);
  const isDue = upcoming && upcoming.daysUntil === 0;
  const saveStatus = async (newStatus, extra = {}) => {
    if (!outreachKey) return;
    const record = {
      status: newStatus,
      month: upcoming.month,
      year: upcoming.year,
      updatedOn: localDateISO(),
      ...extra
    };
    const result = await window.storage.set(outreachKey, JSON.stringify(record), true);
    if (!result) throw new Error("Storage failed");
    setStatus(newStatus);
  };
  const toggleMenu = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 230;
      const menuHeight = 260; // task list can be tall
      const openUpward = rect.top > menuHeight + 10;
      const top = openUpward ? Math.max(8, rect.top - menuHeight - 6) : rect.bottom + 6;
      let left = rect.right - menuWidth;
      if (left < 8) left = 8;
      const maxLeft = window.innerWidth - menuWidth - 8;
      if (left > maxLeft) left = Math.max(8, maxLeft);
      setMenuPos({
        top,
        left
      });
    }
    setMenuOpen(o => !o);
  };
  // Step 1: soft-touch outreach — recaps the plan and asks if they want pricing info,
  // deliberately without dollar amounts so it doesn't read as an unsolicited sales pitch.
  const handleSendIntro = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!upcoming) return;
    setError(null);
    const taskList = upcoming.tasks.map(t => `• ${normalizeTaskText(t)}`).join("\n");
    const timing = upcoming.daysUntil === 0 ? `this month (${upcoming.month})` : `coming up in ${upcoming.month}`;
    const message = `Hi ${client.name.split(" ")[0]}, this is Nick with Mow Masters of Edmond! Hope you've been happy with your recent service.\n\nLooking ahead, here's what your lawn care plan calls for ${timing}:\n${taskList}\n\nWould you like information on those upcoming tasks in your lawn care plan?`;
    try {
      await navigator.clipboard.writeText(message);
      await saveStatus("sent");
      setCopied(true);
      setMenuOpen(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Couldn't copy — try again.");
    }
  };
  const handleMarkPending = async e => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await saveStatus("pending");
      setMenuOpen(false);
    } catch (err) {
      setError("Couldn't save — try again.");
    }
  };
  // Step 2: they replied yes — build a quote from whichever tasks are actually billable.
  const handleCopyQuote = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!upcoming) return;
    setError(null);
    const classified = classifyLawnPlanTasks(upcoming.tasks, client);
    const billable = classified.filter(c => selectedTasks.includes(c.text) && c.price != null);
    if (billable.length === 0) {
      setError("Pick at least one service first.");
      return;
    }
    // Advice items aren't selectable, but they're still worth including as free
    // guidance — it makes the quote read like a full seasonal plan, not just a bill.
    const advice = classified.filter(c => c.price == null && !c.needsSqft);
    const total = billable.reduce((sum, c) => sum + c.price, 0);
    const lines = [];
    lines.push("Here's pricing for what we can take care of:");
    billable.forEach(c => lines.push(`• ${c.service.label} — ${fmt(c.price)}`));
    if (billable.length > 1) lines.push(`Total: ${fmt(total)}`);
    if (advice.length > 0) {
      lines.push("\nAlso recommended this month (no charge, just good practice):");
      advice.forEach(c => lines.push(`• ${c.text}`));
    }
    const message = `Hi ${client.name.split(" ")[0]}, thanks for getting back to me!\n\n${lines.join("\n")}\n\nJust let me know which of these you'd like scheduled and I'll get you on the calendar.`;
    try {
      await navigator.clipboard.writeText(message);
      await saveStatus("quoted", {
        quotedTasks: billable.map(c => c.text),
        quotedTotal: total
      });
      setCopied(true);
      setMenuOpen(false);
      setSelectedTasks([]);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Couldn't copy — try again.");
    }
  };
  const handleDecline = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!upcoming) return;
    setError(null);
    try {
      const result = await window.storage.get(`lawn-plan-declines:${client.id}`, true);
      const existing = result && result.value ? JSON.parse(result.value) : [];
      const record = {
        month: upcoming.month,
        year: upcoming.year,
        tasks: upcoming.tasks,
        declinedOn: localDateISO()
      };
      const saveResult = await window.storage.set(`lawn-plan-declines:${client.id}`, JSON.stringify([...existing, record]), true);
      if (!saveResult) throw new Error("Storage failed");
      // Also append a dated line to the client's notes so the decline is visible right
      // on their card, not just buried in the plan data.
      const stamp = new Date().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
      const noteLine = `[${stamp}] Declined ${upcoming.month} lawn plan: ${upcoming.tasks.map(normalizeTaskText).join(", ")}`;
      // Confirmation the customer receives — copied for sending, and logged verbatim
      // to notes so both sides have the same record of what was declined and when.
      const confirmMsg = `Hi ${client.name.split(" ")[0]}, no problem at all — I've noted that you'd like to pass on the ${upcoming.month} lawn plan services for now (${upcoming.tasks.map(normalizeTaskText).join(", ")}). Nothing has been scheduled and there's no charge. Your regular mowing service continues as normal, and I'll check back when the next seasonal items come up. Thanks!`;
      const updatedNote = client.note ? `${client.note}\n${noteLine}\n  ↳ Sent: "${confirmMsg}"` : `${noteLine}\n  ↳ Sent: "${confirmMsg}"`;
      await updateClient(client.id, {
        note: updatedNote
      }).catch(() => {
        // decline itself already saved — the note is a convenience, not critical
      });
      await navigator.clipboard.writeText(confirmMsg).catch(() => {
        // clipboard unavailable — the note still holds the message text
      });
      await saveStatus("declined").catch(() => {
        // decline record already saved — status write is secondary
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setMenuOpen(false);
      await loadAll();
    } catch (err) {
      setError("Couldn't save that — try again.");
    }
  };
  const toggleTask = text => {
    setSelectedTasks(prev => prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]);
  };
  const statusColors = {
    sent: "#8A6A1C",
    pending: "#B58A2C",
    // Red, not teal — the Plan button behind it is teal, so a green badge disappeared
    // into it. Quoted work is still outstanding, so it should read as needing attention.
    quoted: "#A32D2D",
    declined: "#8A7F6E"
  };
  const badgeColor = copied ? "#5C7A3E" : status ? statusColors[status] : isDue ? "#B5602F" : "#A32D2D";
  // A quoted client keeps showing the task count — the quote is out but the work isn't
  // won yet, so the count stays until it's either sold (scheduled) or declined.
  const badgeText = copied ? "\u2713" : status === "sent" ? "\u2709" : status === "pending" ? "?" : status === "declined" ? "\u2715" : status === "quoted" ? upcoming ? upcoming.tasks.length : "" : isDue ? "\u26A0" : upcoming ? upcoming.tasks.length : "";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      width: 52
    }
  }, /*#__PURE__*/React.createElement("button", {
    ref: btnRef,
    onClick: toggleMenu,
    title: upcoming ? `${upcoming.month}${status ? ` — ${status}` : isDue ? " — due now" : ` — ${upcoming.daysUntil}d`}: ${upcoming.tasks.map(normalizeTaskText).join(", ")}` : "Lawn plan options",
    "aria-label": "Lawn plan options",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 32,
      height: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "#2D6E5C",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(MapPin, {
    size: 15,
    color: "#fff"
  })), upcoming && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -3,
      right: -3,
      width: 16,
      height: 16,
      borderRadius: "50%",
      border: "2px solid #FBF8F0",
      background: badgeColor,
      color: "#fff",
      fontSize: 8,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1,
      animation: isDue && !copied && !status ? "pulse-badge 1.6s ease-in-out infinite" : "none"
    }
  }, badgeText)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, "Plan")), menuOpen && /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(false);
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 190
    }
  }), menuOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: menuPos.top,
      left: menuPos.left,
      zIndex: 200,
      background: "#fff",
      border: "1px solid #DDD3BC",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      width: 230,
      maxHeight: "70vh",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      fontSize: 10,
      color: "#8A7F6E",
      borderBottom: "1px solid #E9E1CC",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, upcoming ? `${upcoming.month} ${upcoming.year}${status ? ` — ${status}` : isDue ? " — due now" : ` — ${upcoming.daysUntil}d`}` : "Nothing due in the next 45 days"), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(false);
    },
    "aria-label": "Close",
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: "#8A7F6E",
      fontSize: 15,
      lineHeight: 1,
      flexShrink: 0
    }
  }, "\u00D7")), upcoming && /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 170,
      overflowY: "auto",
      borderBottom: "1px solid #E9E1CC"
    }
  }, classifyLawnPlanTasks(upcoming.tasks, client).map((c, i) => {
    // Advice items (watering, mowing height, monitoring) aren't services we sell, so
    // they can't be picked into a quote — but they're still important guidance for the
    // customer, so they're styled bold with an amber accent rather than dimmed away.
    const selectable = c.price != null;
    const isAdvice = !selectable && !c.needsSqft;
    return /*#__PURE__*/React.createElement("label", {
      key: i,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        padding: "7px 10px",
        borderBottom: "1px solid #F0EAD8",
        borderLeft: isAdvice ? "3px solid #B58A2C" : "3px solid transparent",
        background: isAdvice ? "#FBF3DE" : "transparent",
        fontSize: 11,
        fontWeight: isAdvice ? 700 : 400,
        color: isAdvice ? "#5C4E2E" : "#2A2620",
        cursor: selectable ? "pointer" : "default"
      }
    }, selectable ? /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: selectedTasks.includes(c.text),
      onChange: () => toggleTask(c.text),
      style: {
        marginTop: 2,
        flexShrink: 0
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 13,
        flexShrink: 0,
        textAlign: "center",
        color: "#B58A2C"
      }
    }, isAdvice ? "!" : ""), /*#__PURE__*/React.createElement("span", null, c.text, c.price != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#2D6E5C",
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace"
      }
    }, " ", fmt(c.price)) : c.needsSqft ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#B5602F",
        fontStyle: "italic",
        fontWeight: 400
      }
    }, " (add sqft to price)") : /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#B58A2C",
        fontWeight: 700,
        textTransform: "uppercase",
        fontSize: 9,
        letterSpacing: 0.3
      }
    }, " \u00B7 advice")));
  })), /*#__PURE__*/React.createElement("div", null, upcoming && selectedTasks.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: handleCopyQuote,
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderBottom: "1px solid #E9E1CC",
      background: "#EAF0E1",
      cursor: "pointer",
      fontSize: 12,
      color: "#2D6E5C",
      fontWeight: 700
    }
  }, "Copy quote for ", selectedTasks.length, " selected"), /*#__PURE__*/React.createElement("a", {
    href: buildMeasureLawnURL(client),
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => setMenuOpen(false),
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      borderBottom: "1px solid #E9E1CC",
      background: "#fff",
      cursor: "pointer",
      fontSize: 12,
      color: "#2D6E5C",
      textDecoration: "none",
      boxSizing: "border-box"
    }
  }, "Open MeasureLawn.com"), upcoming && status !== "declined" && /*#__PURE__*/React.createElement("button", {
    onClick: handleSendIntro,
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderBottom: "1px solid #E9E1CC",
      background: "#fff",
      cursor: "pointer",
      fontSize: 12,
      color: "#2A2620"
    }
  }, status ? "Re-copy intro message" : "Copy intro message"), upcoming && status && status !== "declined" && /*#__PURE__*/React.createElement("button", {
    onClick: handleMarkPending,
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderBottom: "1px solid #E9E1CC",
      background: "#fff",
      cursor: "pointer",
      fontSize: 12,
      color: "#B58A2C"
    }
  }, "Mark awaiting reply"), upcoming && /*#__PURE__*/React.createElement("button", {
    onClick: handleDecline,
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      border: "none",
      background: "#fff",
      cursor: "pointer",
      fontSize: 12,
      color: "#A65438"
    }
  }, "Customer declined")), error && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 10px",
      fontSize: 10,
      color: "#A65438"
    }
  }, error)));
}

// ---------- LAWN PLAN PDF UPLOAD (parses a downloaded MeasureLawn-style calendar
// into month -> task-list data, stored per client, used for advance reminders) ----------

let pdfJsLoaderPromise = null;
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfJsLoaderPromise) return pdfJsLoaderPromise;
  pdfJsLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => {
      pdfJsLoaderPromise = null;
      reject(new Error("Failed to load PDF reader"));
    };
    document.head.appendChild(script);
  });
  return pdfJsLoaderPromise;
}
// MeasureLawn's calendar is a 3-column grid, so text items sharing a vertical position
// belong to *different months*. This gap width (in PDF points) marks a column boundary —
// without splitting on it, "Leaf Cleanup" (October) and "Winterize Your Lawn" (November)
// merge into one bogus task.
const COLUMN_GAP_THRESHOLD = 40;
// Returns positioned text fragments (not flattened lines), since a calendar grid needs
// x/y to tell which month column a task belongs to.
async function extractPdfFragments(page) {
  const content = await page.getTextContent();
  const rowMap = new Map();
  content.items.forEach(item => {
    if (!item.str || !item.str.trim()) return;
    const y = Math.round(item.transform[5] / 3) * 3;
    if (!rowMap.has(y)) rowMap.set(y, []);
    rowMap.get(y).push({
      x: item.transform[4],
      width: item.width || 0,
      str: item.str
    });
  });
  // Merge adjacent fragments within a row, but break at large horizontal gaps —
  // those gaps are the boundaries between month columns.
  const fragments = [];
  [...rowMap.entries()].sort((a, b) => b[0] - a[0]).forEach(([y, items]) => {
    const sorted = items.sort((a, b) => a.x - b.x);
    let parts = [];
    let startX = null;
    let prevEnd = null;
    const flush = () => {
      if (parts.length === 0) return;
      const text = parts.join(" ").replace(/\s+/g, " ").trim();
      if (text) fragments.push({
        x: startX,
        y,
        text
      });
      parts = [];
      startX = null;
    };
    sorted.forEach(item => {
      if (prevEnd !== null && item.x - prevEnd > COLUMN_GAP_THRESHOLD) flush();
      if (startX === null) startX = item.x;
      parts.push(item.str);
      prevEnd = item.x + item.width;
    });
    flush();
  });
  return fragments;
}
// Builds month -> tasks by locating each month header's position, then claiming the
// fragments that sit in that header's column and below it (until the next month header
// in the same column). This is what makes a 3-column calendar parse correctly.
function parseLawnPlanFragments(fragments) {
  const skipPatterns = [/^\d+\s+tasks?$/i, /measurelawn\.com/i, /total tasks/i, /^Generated\b/i, /^Scan to view/i, /^Lawn Care Calendar$/i, /\bsq\s*ft\b/i, /\b(Basic|Standard|Premium)\s+Plan\b/i, /^\d{1,2}\/\d{1,2}\/\d{2,4}/, /^about:blank/i, /^https?:\/\//i, /^\d+\s*\/\s*\d+$/i, /^page\s+\d+/i, /^[\d\s\/\-]+$/];
  // Month headers: a fragment that starts with a month name (optionally followed by
  // its "N tasks" badge, which may or may not have merged into the same fragment).
  const headers = [];
  fragments.forEach(f => {
    const match = MONTH_NAMES.find(m => f.text === m || f.text.startsWith(m + " ") && /\d+\s+tasks?$/i.test(f.text));
    if (match) headers.push({
      month: match,
      x: f.x,
      y: f.y
    });
  });
  const months = {};
  headers.forEach(h => {
    months[h.month] = months[h.month] || [];
  });
  if (headers.length === 0) return months;
  const COLUMN_TOLERANCE = 60; // how far a task can sit from its header's left edge
  fragments.forEach(f => {
    const text = f.text.trim();
    if (!text || text.length < 4) return;
    if (skipPatterns.some(p => p.test(text))) return;
    if (headers.some(h => h.x === f.x && h.y === f.y)) return; // the header itself
    // Candidate headers: same column, and positioned above this fragment.
    const candidates = headers.filter(h => Math.abs(h.x - f.x) <= COLUMN_TOLERANCE && h.y > f.y);
    if (candidates.length === 0) return;
    // Nearest header above wins — that's the month this task lives under.
    const owner = candidates.reduce((best, h) => h.y < best.y ? h : best);
    months[owner.month].push(text);
  });
  return months;
}
async function parseLawnPlanPDF(file) {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer
  }).promise;
  let allFragments = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const fragments = await extractPdfFragments(page);
    allFragments = allFragments.concat(fragments);
  }
  const months = parseLawnPlanFragments(allFragments);
  const totalTasks = Object.values(months).reduce((sum, arr) => sum + arr.length, 0);
  if (totalTasks === 0) {
    throw new Error("Couldn't find any month/task data in this PDF — it may not match the expected format.");
  }
  return {
    months,
    uploadedAt: localDateISO(),
    sourceFileName: file.name
  };
}
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Couldn't read the file"));
    reader.readAsDataURL(file);
  });
}
function LawnPlanUpload({
  client
}) {
  const [status, setStatus] = useState("idle"); // idle | parsing | done | error
  const [error, setError] = useState(null);
  const [existingPlan, setExistingPlan] = useState(undefined); // undefined = loading, null = none
  const [pdfDataUrl, setPdfDataUrl] = useState(undefined);
  const [showFullPlan, setShowFullPlan] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(`lawn-plan:${client.id}`, true);
        if (!cancelled) setExistingPlan(result && result.value ? JSON.parse(result.value) : null);
      } catch (e) {
        if (!cancelled) setExistingPlan(null);
      }
      try {
        const fileResult = await window.storage.get(`lawn-plan-file:${client.id}`, true);
        if (!cancelled) setPdfDataUrl(fileResult && fileResult.value ? fileResult.value : null);
      } catch (e) {
        if (!cancelled) setPdfDataUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id]);
  const handleFile = async e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // allow re-uploading the same filename later
    if (!file) return;
    setStatus("parsing");
    setError(null);
    try {
      const plan = await parseLawnPlanPDF(file);
      const dataUrl = await readFileAsDataURL(file);
      const result = await window.storage.set(`lawn-plan:${client.id}`, JSON.stringify(plan), true);
      if (!result) throw new Error("Storage failed");
      // Keep the original PDF too, so it can always be reopened later — separate
      // storage key so the (much smaller) task list loads fast everywhere else
      // that just needs the plan, without dragging the whole PDF along with it.
      await window.storage.set(`lawn-plan-file:${client.id}`, dataUrl, true).catch(() => {
        // best-effort — the parsed task list still saved fine even if this fails
      });
      setExistingPlan(plan);
      setPdfDataUrl(dataUrl);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setError(err.message || "Couldn't read that PDF — try again.");
      setStatus("error");
    }
  };
  const totalTasks = existingPlan ? Object.values(existingPlan.months).reduce((sum, arr) => sum + arr.length, 0) : 0;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "Lawn care plan (PDF from MeasureLawn.com)"), existingPlan && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#5C7A3E",
      marginBottom: 4,
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2713 ", totalTasks, " tasks loaded from \"", existingPlan.sourceFileName, "\" (", existingPlan.uploadedAt, ")"), pdfDataUrl && /*#__PURE__*/React.createElement("a", {
    href: pdfDataUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    download: existingPlan.sourceFileName || "lawn-plan.pdf",
    style: {
      color: "#2D6E5C",
      fontWeight: 600
    }
  }, "View PDF"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFullPlan(s => !s),
    style: {
      background: "none",
      border: "none",
      padding: 0,
      color: "#2D6E5C",
      fontWeight: 600,
      fontSize: 11,
      cursor: "pointer"
    }
  }, showFullPlan ? "Hide full plan" : "View full plan")), showFullPlan && existingPlan && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FBF8F0",
      border: "1px solid #DDD3BC",
      borderRadius: 6,
      padding: 10,
      marginBottom: 8,
      maxHeight: 260,
      overflowY: "auto"
    }
  }, MONTH_NAMES.filter(m => existingPlan.months[m] && existingPlan.months[m].length > 0).map(m => /*#__PURE__*/React.createElement("div", {
    key: m,
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 11,
      color: "#2A2620"
    }
  }, m), existingPlan.months[m].map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 11,
      color: "#5C5346",
      marginLeft: 8
    }
  }, "\u2022 ", normalizeTaskText(t)))))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-block",
      padding: "8px 12px",
      borderRadius: 6,
      border: "1px solid #DDD3BC",
      background: status === "done" ? "#5C7A3E" : "#fff",
      color: status === "done" ? "#fff" : "#3E5C2C",
      fontSize: 12,
      cursor: status === "parsing" ? "default" : "pointer"
    }
  }, status === "parsing" ? "Reading PDF…" : status === "done" ? "Plan loaded ✓" : existingPlan ? "Replace plan PDF" : "Upload plan PDF", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "application/pdf",
    onChange: handleFile,
    disabled: status === "parsing",
    style: {
      display: "none"
    }
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438",
      marginTop: 4
    }
  }, error));
}

// ---------- LAWN PLAN REMINDER (surfaces next month's tasks a month ahead, one tap
// copies a ready-to-send heads-up message to the client) ----------

// Finds the nearest date (this year or next) that falls in the given calendar month.
// If today is already inside that month, treats it as due right now (0 days out)
// rather than skipping ahead a full year.
function nearestMonthOccurrence(monthIdx, refDate = new Date()) {
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);
  if (today.getMonth() === monthIdx) return today;
  let candidate = new Date(today.getFullYear(), monthIdx, 1);
  if (candidate < today) candidate = new Date(today.getFullYear() + 1, monthIdx, 1);
  return candidate;
}
// Nearest upcoming month (within `withinDays`) that has tasks and hasn't been marked
// declined for that specific month/year cycle — used for the per-client badge, which
// only needs to show the single soonest thing actually still relevant.
function getUpcomingLawnPlanTasks(plan, withinDays = 45, refDate = new Date(), declinedKeys = []) {
  if (!plan || !plan.months) return null;
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);
  let best = null;
  MONTH_NAMES.forEach((name, idx) => {
    const tasks = plan.months[name];
    if (!tasks || tasks.length === 0) return;
    const due = nearestMonthOccurrence(idx, today);
    const daysUntil = Math.round((due - today) / 86400000);
    const declineKey = `${name}-${due.getFullYear()}`;
    if (declinedKeys.includes(declineKey)) return;
    if (daysUntil >= 0 && daysUntil <= withinDays) {
      if (!best || daysUntil < best.daysUntil) {
        best = {
          month: name,
          year: due.getFullYear(),
          tasks,
          daysUntil
        };
      }
    }
  });
  return best;
}
function WazeStopButton({
  client
}) {
  const [copied, setCopied] = useState(false);
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText("Nick w/ Mow Master, we are heading your way!");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // clipboard unavailable — Waze still opens below
    }
  };
  return /*#__PURE__*/React.createElement("a", {
    href: buildWazeStopURL(client),
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: handleClick,
    title: "Open in Waze — copies \"heading your way\" message to clipboard",
    "aria-label": "Navigate to this stop in Waze and copy heading-your-way message",
    style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      background: copied ? "#5C7A3E" : "#33CCFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      textDecoration: "none"
    }
  }, copied ? /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 12,
    color: "#fff"
  }) : /*#__PURE__*/React.createElement(MapPin, {
    size: 12,
    color: "#fff"
  }));
}
// ---------- SUNSET PREDICTION (NOAA solar equation, Edmond OK coordinates) ----------

const EDMOND_LAT = 35.6528;
const EDMOND_LON = -97.4781;
function computeSunsetUTCHours(date, lat, lon) {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000);
  const lngHour = lon / 15;
  const t = dayOfYear + (18 - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
  L = (L + 360) % 360;
  let RA = (180 / Math.PI) * Math.atan(0.91764 * Math.tan(L * rad));
  RA = (RA + 360) % 360;
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;
  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const zenith = 90.83;
  const cosH = (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null; // polar day/night — never happens at this latitude, but guard anyway
  let H = (180 / Math.PI) * Math.acos(cosH) / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  let UT = T - lngHour;
  UT = (UT + 24) % 24;
  return UT;
}
function getSunsetLabel(dayName) {
  const iso = nearestUpcomingWeekday(dayName);
  if (!iso) return null;
  const localDate = new Date(`${iso}T12:00:00`);
  const utHours = computeSunsetUTCHours(localDate, EDMOND_LAT, EDMOND_LON);
  if (utHours == null) return null;
  const utcMoment = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
  const hours = Math.floor(utHours);
  const minutes = Math.round((utHours - hours) * 60);
  utcMoment.setUTCHours(hours, minutes, 0, 0);
  return utcMoment.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago"
  });
}
// ---------- STOP FINANCIALS (price + bagging/tall-grass checkboxes + scheduled other-services) ----------

const TALL_GRASS_SURCHARGE_PCT = 0.5; // 50% added to the base mow price when grass is over 6"
const BAGGING_FLAT_FEE = 25;
function StopFinancials({
  client,
  day,
  refreshTick
}) {
  const stopDate = nearestUpcomingWeekday(day);
  const [scheduled, setScheduled] = useState([]);
  const [extras, setExtras] = useState({
    bagging: false,
    tallGrass: false
  });
  const [loaded, setLoaded] = useState(false);
  const extrasKey = `visit-extras:${client.id}:${stopDate}`;
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await getScheduledServices(client.id);
      const todays = all.filter(e => e.date === stopDate);
      let savedExtras = {
        bagging: false,
        tallGrass: false
      };
      try {
        const result = await window.storage.get(extrasKey, true);
        if (result && result.value) savedExtras = JSON.parse(result.value);
      } catch (e) {
        // no extras saved yet for this date — defaults stand
      }
      if (!cancelled) {
        setScheduled(todays);
        setExtras(savedExtras);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id, stopDate, refreshTick]);
  const toggleExtra = async key => {
    const next = {
      ...extras,
      [key]: !extras[key]
    };
    setExtras(next);
    try {
      await window.storage.set(extrasKey, JSON.stringify(next), true);
    } catch (e) {
      // best-effort — worst case it doesn't persist across reload
    }
  };
  const scheduledTotal = scheduled.reduce((sum, e) => sum + (e.price || 0), 0);
  const baggingAmount = extras.bagging ? BAGGING_FLAT_FEE : 0;
  const tallGrassAmount = extras.tallGrass ? Math.round(client.price * TALL_GRASS_SURCHARGE_PCT * 100) / 100 : 0;
  const subtotal = (client.price || 0) + scheduledTotal + baggingAmount + tallGrassAmount;
  const referralDiscountAmount = client.referralDiscountPct ? Math.round(subtotal * (client.referralDiscountPct / 100) * 100) / 100 : 0;
  const total = Math.round((subtotal - referralDiscountAmount) * 100) / 100;
  const hasExtras = scheduledTotal > 0 || baggingAmount > 0 || tallGrassAmount > 0 || referralDiscountAmount > 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      fontSize: 11,
      color: "#5C5346"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: extras.bagging,
    onChange: () => toggleExtra("bagging"),
    disabled: !loaded
  }), "Bagging (+", fmt(BAGGING_FLAT_FEE), ")"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: extras.tallGrass,
    onChange: () => toggleExtra("tallGrass"),
    disabled: !loaded
  }), "Over 6\" (+50%)*")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14,
      color: "#B5602F",
      fontWeight: 700,
      whiteSpace: "nowrap"
    }
  }, fmt(total))), hasExtras && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#8A7F6E",
      marginTop: 3
    }
  }, [scheduled.map(e => `${e.label} +${fmt(e.price || 0)}`), baggingAmount > 0 ? `Bagging +${fmt(baggingAmount)}` : null, tallGrassAmount > 0 ? `Tall grass +${fmt(tallGrassAmount)}` : null, referralDiscountAmount > 0 ? `Referral discount -${fmt(referralDiscountAmount)}` : null].flat().filter(Boolean).join(" · ")), extras.tallGrass && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#8A7F6E",
      marginTop: 3,
      fontStyle: "italic"
    }
  }, "*Overgrown grass forces a lawn mower to work much harder than normal. It overworks the engine, clogs the under-deck area with thick clumps, and dulls or bends the cutting blades."));
}
function WeekAccordion({
  onPaymentsChanged
}) {
  const {
    clients,
    loading
  } = useClients();
  const [openDay, setOpenDay] = useState(ROUTE_DAYS[new Date().getDay() - 1] || "Monday");
  const [editingId, setEditingId] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  if (loading) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      color: "#8A7F6E",
      fontSize: 13
    }
  }, "Loading…");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, ROUTE_DAYS.map(day => {
    const stops = clientsForDay(clients, day);
    const isOpen = openDay === day;
    const sunsetLabel = getSunsetLabel(day);
    return /*#__PURE__*/React.createElement("div", {
      key: day,
      style: {
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #DDD3BC"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpenDay(isOpen ? null : day),
      style: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 14px",
        background: isOpen ? "#3E5C2C" : "#FBF8F0",
        color: isOpen ? "#F2EDDD" : "#2A2620",
        border: "none",
        cursor: "pointer",
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'Roboto Slab', serif",
        fontWeight: 700,
        fontSize: 15
      }
    }, day), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12
      }
    }, stops.length, " stop", stops.length === 1 ? "" : "s", " · ", fmt(dayRevenue(clients, day))), sunsetLabel && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: isOpen ? "#C9D9B8" : "#8A7F6E",
        display: "flex",
        alignItems: "center",
        gap: 3
      }
    }, "\uD83C\uDF07 ", sunsetLabel), /*#__PURE__*/React.createElement(ChevronRight, {
      size: 16,
      style: {
        transform: isOpen ? "rotate(90deg)" : "none",
        transition: "transform 0.15s"
      }
    }))), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#FBF8F0",
        padding: "6px 14px 14px"
      }
    }, stops.length > 0 && /*#__PURE__*/React.createElement("a", {
      href: buildRouteURL(stops),
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "9px 14px",
        borderRadius: 8,
        background: "#2D6E5C",
        color: "#fff",
        textDecoration: "none",
        fontFamily: "'Roboto Slab', serif",
        fontWeight: 700,
        fontSize: 13,
        margin: "8px 0 4px"
      }
    }, /*#__PURE__*/React.createElement(MapPin, {
      size: 14
    }), "Navigate this route (", stops.length, " stop", stops.length === 1 ? "" : "s", ")"), /*#__PURE__*/React.createElement(RouteFuelEstimate, {
      day: day,
      stops: stops
    }), stops.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "#8A7F6E",
        padding: "8px 0"
      }
    }, "No stops scheduled.") : stops.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: c.id,
      style: {
        padding: "10px 0",
        borderTop: i > 0 ? "1px solid #E9E1CC" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#5C7A3E",
        color: "#fff",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 1
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14,
        color: "#2A2620"
      }
    }, c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5C5346",
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(MapPin, {
      size: 11
    }), " ", c.address), c.note && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#B58A2C",
        marginTop: 2
      }
    }, c.note)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(WazeStopButton, {
      client: c
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setEditingId(editingId === c.id ? null : c.id),
      title: "Edit client",
      "aria-label": "Edit client",
      style: {
        width: 22,
        height: 22,
        borderRadius: 6,
        border: "none",
        background: editingId === c.id ? "#5C7A3E" : "#DDD3BC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Pencil, {
      size: 12,
      color: editingId === c.id ? "#fff" : "#5C5346"
    })))), editingId === c.id && /*#__PURE__*/React.createElement(EditClientForm, {
      client: c,
      onClose: () => setEditingId(null)
    }), /*#__PURE__*/React.createElement(StopFinancials, {
      client: c,
      day: day,
      refreshTick: refreshTick
    }), (c.status === "active" || c.status === "as-needed") && /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 32,
        marginTop: 8,
        paddingTop: 8,
        borderTop: "1px solid #E9E1CC",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(MorningReminder, {
      client: c
    }), /*#__PURE__*/React.createElement(VisitTimer, {
      client: c
    }), /*#__PURE__*/React.createElement(PaymentRequest, {
      client: c,
      onPaid: () => {
        setRefreshTick(t => t + 1);
        if (onPaymentsChanged) onPaymentsChanged();
      }
    }), /*#__PURE__*/React.createElement(VisitReview, {
      client: c
    }), /*#__PURE__*/React.createElement(OtherServicesButton, {
      client: c,
      onScheduled: () => setRefreshTick(t => t + 1)
    }), /*#__PURE__*/React.createElement(MeasureLawnButton, {
      client: c,
      refreshTick: refreshTick
    }), /*#__PURE__*/React.createElement(RescheduleButton, {
      client: c,
      onChanged: () => setRefreshTick(t => t + 1)
    }))))));
  }));
}

// ---------- VISIT TIMER (start/stop per client, persisted via window.storage) ----------

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function avgDuration(log) {
  if (!log || log.length === 0) return null;
  const sum = log.reduce((a, v) => a + v.minutes, 0);
  return Math.round(sum / log.length);
}
function VisitTimer({
  client
}) {
  const {
    updateClient
  } = useClients();
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [log, setLog] = useState(null); // null = loading, [] = loaded empty
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);
  const [justCopied, setJustCopied] = useState(null); // null | "start" | "stop"
  const tickRef = useRef(null);
  const storageKey = `timer-active:${client.id}`;
  const logKey = `timer-log:${client.id}`;

  // Load persisted state on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const active = await window.storage.get(storageKey, true);
        if (!cancelled && active && active.value) {
          const parsed = JSON.parse(active.value);
          setRunning(true);
          setStartedAt(parsed.startedAt);
        }
      } catch (e) {
        // no active timer stored — that's fine
      }
      try {
        const logResult = await window.storage.get(logKey, true);
        if (!cancelled) {
          setLog(logResult && logResult.value ? JSON.parse(logResult.value) : []);
        }
      } catch (e) {
        if (!cancelled) setLog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id]);

  // Tick while running
  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(tickRef.current);
    }
  }, [running]);
  const handleStart = async () => {
    const ts = Date.now();
    setError(null);
    try {
      const result = await window.storage.set(storageKey, JSON.stringify({
        startedAt: ts
      }), true);
      if (!result) throw new Error("Storage write failed");
      setStartedAt(ts);
      setRunning(true);
      setNow(ts);
    } catch (e) {
      setError("Couldn't start timer — try again.");
    }
    try {
      await navigator.clipboard.writeText("We are here!  Please bring in the pets if there are any outback!");
      setJustCopied("start");
      setTimeout(() => setJustCopied(null), 2000);
    } catch (e) {
      // clipboard unavailable — timer still started
    }
  };
  const handleStop = async () => {
    if (!startedAt) return;
    const endTs = Date.now();
    const minutes = Math.round((endTs - startedAt) / 60000);
    setError(null);
    try {
      const newEntry = {
        date: localDateISO(new Date(endTs)),
        minutes
      };
      const newLog = [newEntry, ...(log || [])].slice(0, 20);
      const setLogResult = await window.storage.set(logKey, JSON.stringify(newLog), true);
      if (!setLogResult) throw new Error("Log write failed");
      await window.storage.delete(storageKey, true);
      setLog(newLog);
      setRunning(false);
      setStartedAt(null);
      // If this client was referred and this is their FIRST completed visit, the
      // referrer earns their 20% now — not at signup, so a no-show never triggers it.
      if (client.pendingReferrerId && newLog.length === 1) {
        try {
          await updateClient(client.pendingReferrerId, {
            referralDiscountPct: 20
          });
          await updateClient(client.id, {
            pendingReferrerId: null
          });
        } catch (err) {
          // visit is logged either way; the credit can be applied manually if this fails
        }
      }
    } catch (e) {
      setError("Couldn't save that visit — timer left running, try stop again.");
    }
    try {
      await navigator.clipboard.writeText(`All wrapped up if you want to come check it out!  Otherwise see you next time!\nhttps://cash.app/${CASHTAG}\n\nFollow us on Facebook: https://www.facebook.com/profile.php?id=61592207131820`);
      setJustCopied("stop");
      setTimeout(() => setJustCopied(null), 2000);
    } catch (e) {
      // clipboard unavailable — visit still logged
    }
  };
  const elapsedMs = running && startedAt ? now - startedAt : 0;
  const confirmed = log && log.length > 0 ? avgDuration(log) : client.duration;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      width: 52
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: running ? handleStop : handleStart,
    title: running ? "Stop visit — copies wrap-up message + Cash App link" : "Start visit — copies arrival message",
    "aria-label": running ? "Stop visit timer" : "Start visit timer",
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      background: running ? "#A65438" : "#5C7A3E",
      flexShrink: 0
    }
  }, running ? /*#__PURE__*/React.createElement(Square, {
    size: 14,
    fill: "#fff"
  }) : /*#__PURE__*/React.createElement(Play, {
    size: 14,
    fill: "#fff"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: running ? "#A65438" : "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, justCopied ? "Copied ✓" : running ? formatElapsed(elapsedMs) : confirmed != null ? log && log.length > 0 ? `${confirmed}m avg` : `~${confirmed}m est.` : "Timer"), log && log.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowHistory(s => !s),
    title: "Visit history",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#5C7A3E",
      display: "flex",
      padding: 0
    },
    "aria-label": "Visit history"
  }, /*#__PURE__*/React.createElement(History, {
    size: 12
  }))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438",
      flexBasis: "100%"
    }
  }, error), showHistory && log && log.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      flexBasis: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, log.map((entry, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      color: "#5C5346"
    }
  }, /*#__PURE__*/React.createElement("span", null, entry.date), /*#__PURE__*/React.createElement("span", null, entry.minutes, " min")))));
}
const CASHTAG = "$instock1999";

// ---------- PAYMENT REQUEST ----------

function buildCashAppLink(amount) {
  return `https://cash.app/${CASHTAG}/${amount}`;
}
function MorningReminder({
  client
}) {
  const [log, setLog] = useState(null);
  const [error, setError] = useState(null);
  const reminderLogKey = `morning-reminder:${client.id}`;
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(reminderLogKey, true);
        if (!cancelled) setLog(result && result.value ? JSON.parse(result.value) : []);
      } catch (e) {
        if (!cancelled) setLog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id]);
  const message = `Hey good morning!!  ${client.name.split(" ")[0]}, this is Nick from Mow Masters of Edmond —we have you on the schedule for this evening.  Please do us a solid if possble:  pets/toys/hoses picked up  and if at all possible park in the middle of the drive so we can keep those edges clean for you!  Do you have any requests or adjustments you would like to make for tonights service?`;
  const today = localDateISO();
  const todaysEntry = log && log.length > 0 && log[0].date === today ? log[0] : null;
  const stage = todaysEntry ? todaysEntry.status : "idle"; // "idle" | "pending" | "confirmed"
  const saveEntry = async status => {
    const entry = {
      date: today,
      status
    };
    const rest = (log || []).filter(e => e.date !== today);
    const newLog = [entry, ...rest].slice(0, 20);
    const result = await window.storage.set(reminderLogKey, JSON.stringify(newLog), true);
    if (!result) throw new Error("Storage failed");
    setLog(newLog);
  };
  const handleClick = async () => {
    setError(null);
    if (stage === "idle") {
      try {
        await navigator.clipboard.writeText(message);
      } catch (e) {
        setError("Couldn't copy automatically — copy the text below manually.");
      }
      try {
        await saveEntry("pending");
      } catch (e) {
        setError("Couldn't save status, but the text was still copied.");
      }
    } else if (stage === "pending") {
      try {
        await saveEntry("confirmed");
      } catch (e) {
        setError("Couldn't save that update — try again.");
      }
    }
    // stage === "confirmed": no further action, button is done for the day
  };
  const lastEntry = log && log.length > 0 ? log[0] : null;
  const caption = stage === "confirmed" ? "Confirmed" : stage === "pending" ? "Pending" : "Reminder";
  const tooltip = stage === "confirmed" ? `Confirmed ${lastEntry ? lastEntry.date : ""}` : stage === "pending" ? "Reminder copied — tap once they confirm" : "Copy visit reminder to clipboard";
  const buttonColor = stage === "confirmed" ? "#5C7A3E" : "#B58A2C";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      width: 52
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleClick,
    disabled: stage === "confirmed",
    title: tooltip,
    "aria-label": tooltip,
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      border: "none",
      cursor: stage === "confirmed" ? "default" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      background: buttonColor,
      opacity: stage === "confirmed" ? 0.85 : 1,
      flexShrink: 0
    }
  }, stage === "confirmed" ? /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 15
  }) : stage === "pending" ? /*#__PURE__*/React.createElement(Clock, {
    size: 15
  }) : /*#__PURE__*/React.createElement(Sun, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, caption)), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438",
      flexBasis: "100%"
    }
  }, error));
}
function PaymentRequest({
  client,
  onPaid
}) {
  const {
    updateClient
  } = useClients();
  const [log, setLog] = useState(null);
  const [justPaid, setJustPaid] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [winbackGate, setWinbackGateState] = useState(null); // null | "pending" | "confirmed"
  const paymentLogKey = `payment-log:${client.id}`;
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(paymentLogKey, true);
        if (!cancelled) setLog(result && result.value ? JSON.parse(result.value) : []);
      } catch (e) {
        if (!cancelled) setLog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const gate = await getWinbackGate(client.id);
      if (!cancelled) setWinbackGateState(gate);
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id]);
  if (!client.price) return null;
  const link = buildCashAppLink(client.price);
  const message = `Hi ${client.name.split(" ")[0]}, this is Mow Masters of Edmond — today's visit is $${client.price}. Pay here: ${link}`;
  const todayISO = localDateISO();
  const comp = complimentaryVisitInfo(client);
  // A client who was ever inactive/lost carries a win-back gate record. Their comp visit
  // only auto-applies once that gate is explicitly "confirmed" — otherwise the payment
  // button behaves normally even on their birthday-adjacent visit, so a reactivation
  // can't quietly turn into a free mow with no follow-through.
  const isCompToday = !!(comp && comp.isToday) && winbackGate !== "pending";
  const handleRequest = async () => {
    if (isCompToday && !window.confirm(`${client.name.split(" ")[0]}'s birthday visit today is marked complimentary. Send the $${client.price} request anyway?`)) {
      return;
    }
    setError(null);
    setJustPaid(false);
    try {
      const entry = {
        id: Date.now(),
        date: localDateISO(),
        amount: client.price,
        paid: false,
        paidDate: null
      };
      const newLog = [entry, ...(log || [])].slice(0, 20);
      const result = await window.storage.set(paymentLogKey, JSON.stringify(newLog), true);
      if (!result) throw new Error("Storage failed");
      setLog(newLog);
      if (onPaid) onPaid();
    } catch (e) {
      setError("Couldn't log the request, but the link/text below still works.");
    }
    // Always put the full message on the clipboard — the sms: link only works on a
    // phone with a messaging app registered, so on desktop (or if the client has no
    // number on file) the clipboard is the only way to actually get the text out.
    let copiedOk = false;
    try {
      await navigator.clipboard.writeText(message);
      copiedOk = true;
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch (e) {
      // clipboard unavailable — the message is still shown in the log panel below
    }
  };
  const toggleReceived = async entryId => {
    const newLog = (log || []).map(e => e.id === entryId ? {
      ...e,
      paid: !e.paid,
      paidDate: !e.paid ? localDateISO() : null
    } : e);
    setLog(newLog);
    try {
      await window.storage.set(paymentLogKey, JSON.stringify(newLog), true);
    } catch (e) {
      setError("Couldn't save that update — try again.");
    }
  };
  const lastRequest = log && log.length > 0 ? log[0] : null;
  // Entries created before this feature existed have no `paid` field at all — treat those
  // as already-settled so nobody's historical activity suddenly shows up as past due.
  const pending = (log || []).filter(e => e.paid === false);
  // Main button stage — comp takes priority, then whether the most recent request is
  // still outstanding, then a one-tap "Paid" confirmation before resetting for next time.
  const stage = isCompToday ? "comp" : justPaid ? "paid" : lastRequest && lastRequest.paid === false ? "due" : "idle";
  const handleMainClick = async () => {
    if (stage === "comp" || stage === "idle") {
      await handleRequest();
    } else if (stage === "due") {
      setError(null);
      try {
        await toggleReceived(lastRequest.id);
        setJustPaid(true);
        // One-time referral discount is consumed the moment this bill is actually paid,
        // not just "next visit" indefinitely — ties it to a concrete, visible event.
        if (client.referralDiscountPct) {
          await updateClient(client.id, {
            referralDiscountPct: null
          }).catch(() => {
            // best-effort — worst case the discount lingers one extra visit
          });
        }
        if (onPaid) onPaid();
      } catch (e) {
        setError("Couldn't mark that paid — try again.");
      }
    } else if (stage === "paid") {
      setJustPaid(false);
    }
  };
  const stageColor = {
    comp: "#B58A2C",
    due: "#A65438",
    paid: "#5C7A3E",
    idle: "#2D6E5C"
  }[stage];
  const paidDateShort = lastRequest && lastRequest.paidDate ? (() => {
    const [, m, d] = lastRequest.paidDate.split("-");
    return `${Number(m)}/${Number(d)}`;
  })() : "";
  const stageLabel = justCopied ? "Copied ✓" : {
    comp: "Comp'd",
    due: "Pmnt Due",
    paid: paidDateShort ? `Paid ${paidDateShort}` : "Paid",
    idle: "Request Payment"
  }[stage];
  const tooltip = stage === "comp" ? "Birthday visit — complimentary today" : stage === "due" ? `Mark $${client.price} received` : stage === "paid" ? `Paid${paidDateShort ? ` ${paidDateShort}` : ""} — tap to reset` : `Copy $${client.price} request message`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      width: 52
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleMainClick,
    title: tooltip,
    "aria-label": tooltip,
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      background: stageColor,
      flexShrink: 0
    }
  }, stage === "paid" ? /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 15
  }) : stage === "due" ? /*#__PURE__*/React.createElement(XCircle, {
    size: 15
  }) : stage === "comp" ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, "\uD83C\uDF82") : /*#__PURE__*/React.createElement(DollarSign, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, stageLabel), log && log.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowHistory(s => !s),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: pending.length > 0 ? "#B5602F" : "#5C7A3E",
      fontSize: 9,
      fontFamily: "'JetBrains Mono', monospace",
      padding: 0
    }
  }, showHistory ? "hide" : pending.length > 0 ? `${pending.length} due` : "history")), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438",
      flexBasis: "100%"
    }
  }, error), showHistory && log && /*#__PURE__*/React.createElement("div", {
    style: {
      flexBasis: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, log.map(entry => /*#__PURE__*/React.createElement("div", {
    key: entry.id || entry.date,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 10px",
      background: entry.paid === false ? "#FBF3DE" : "#F0EBD8",
      borderRadius: 8,
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("span", null, entry.date, " — $", entry.amount, entry.paidDate ? ` · paid ${entry.paidDate}` : ""), entry.id != null && /*#__PURE__*/React.createElement("button", {
    onClick: () => toggleReceived(entry.id),
    style: {
      padding: "3px 8px",
      borderRadius: 999,
      border: `1px solid ${entry.paid === false ? "#DDD3BC" : "#5C7A3E"}`,
      background: entry.paid === false ? "#fff" : "#5C7A3E",
      color: entry.paid === false ? "#5C5346" : "#fff",
      fontSize: 10,
      cursor: "pointer"
    }
  }, entry.paid === false ? "Mark received" : "Received ✓")))));
}
function AddClientForm({
  onClose,
  referrer
}) {
  const {
    addClient,
    updateClient,
    clients
  } = useClients();
  const [form, setForm] = useState({
    name: "",
    address: "",
    cluster: "Edmond",
    state: "OK",
    zip: "",
    day: suggestBestDay({
      cluster: "Edmond",
      zip: ""
    }, null, clients).suggestedDay,
    frequency: "Weekly",
    nextVisitDate: "",
    price: "",
    status: "active",
    birthday: "",
    sqft: ""
  });
  const [dayTouched, setDayTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm(prev => ({
    ...prev,
    [k]: v
  }));
  const setCluster = value => {
    setForm(prev => ({
      ...prev,
      cluster: value,
      day: dayTouched ? prev.day : suggestBestDay({
        cluster: value,
        zip: prev.zip
      }, null, clients).suggestedDay
    }));
  };
  const setZip = value => {
    setForm(prev => ({
      ...prev,
      zip: value,
      day: dayTouched ? prev.day : suggestBestDay({
        cluster: prev.cluster,
        zip: value
      }, null, clients).suggestedDay
    }));
  };
  const [routeFitStatus, setRouteFitStatus] = useState(null); // null | "loading" | "unavailable" | {day, minMiles, nearestName}
  const handleCheckRouteFit = async () => {
    if (!form.address) {
      setRouteFitStatus("unavailable");
      return;
    }
    setRouteFitStatus("loading");
    const {
      apiKey
    } = await getFuelSettings();
    if (!apiKey) {
      setRouteFitStatus("unavailable");
      return;
    }
    try {
      const fits = await findBestRouteFit(apiKey, form.address, form.cluster, clients, form.state, form.zip);
      const best = fits.find(f => f.minMiles !== Infinity);
      if (best) {
        setDayTouched(true);
        setForm(prev => ({
          ...prev,
          day: best.day
        }));
        setRouteFitStatus(best);
      } else {
        setRouteFitStatus("unavailable");
      }
    } catch (e) {
      setRouteFitStatus("unavailable");
    }
  };
  const handleSave = async () => {
    if (!form.name || !form.address) {
      setError("Name and address are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addClient({
        name: form.name,
        address: form.address,
        cluster: form.cluster,
        state: form.state,
        zip: form.zip,
        day: form.day,
        frequency: form.frequency,
        nextVisitDate: form.nextVisitDate,
        price: form.price ? Number(form.price) : null,
        status: form.status,
        birthday: form.birthday || "",
        sqft: form.sqft ? Number(form.sqft) : null,
        note: referrer ? `Referred by ${referrer.name}` : "",
        // Credit the referrer only after this client's first visit is completed.
        pendingReferrerId: referrer ? referrer.id : null
      });
      onClose();
    } catch (e) {
      setError("Couldn't save — try again.");
      setSaving(false);
    }
  };
  const inputStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    border: "1px solid #DDD3BC",
    fontSize: 13,
    fontFamily: "inherit",
    background: "#fff",
    color: "#2A2620"
  };
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 14,
      marginBottom: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 14,
      color: "#2A2620"
    }
  }, referrer ? "Add referral" : "Add client"), referrer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      borderRadius: 6,
      background: "#FBF3DE",
      border: "1px solid #E9D9A8",
      fontSize: 11,
      color: "#8A6A1C"
    }
  }, "\uD83C\uDF81 Referred by ", referrer.name, " — they'll get 20% off their next bill once this client is saved."), /*#__PURE__*/React.createElement("input", {
    placeholder: "Name",
    value: form.name,
    onChange: e => set("name", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Address",
    value: form.address,
    onChange: e => set("address", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.cluster,
    onChange: e => setCluster(e.target.value),
    style: inputStyle
  }, CLUSTERS.map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c))), /*#__PURE__*/React.createElement("select", {
    value: form.status,
    onChange: e => set("status", e.target.value),
    style: inputStyle
  }, ["active", "as-needed", "pending", "inactive"].map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "State",
    value: form.state,
    onChange: e => set("state", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Zip code",
    value: form.zip,
    onChange: e => setZip(e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("select", {
    value: form.day,
    onChange: e => {
      setDayTouched(true);
      set("day", e.target.value);
    },
    style: inputStyle
  }, [...ROUTE_DAYS, "As-needed"].map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d))), !dayTouched && (() => {
    const suggestion = suggestBestDay({
      cluster: form.cluster,
      zip: form.zip
    }, null, clients);
    return suggestion.bestCount > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#8A7F6E",
        marginTop: -6
      }
    }, "Suggested ", suggestion.bestDay, " — busiest ", suggestion.compareLabel, " day (", suggestion.bestCount, " client", suggestion.bestCount === 1 ? "" : "s", "). Change it above if you'd like a different day.") : null;
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: -6
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCheckRouteFit,
    disabled: routeFitStatus === "loading" || !form.address,
    style: {
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid #DDD3BC",
      background: "#fff",
      color: "#3E5C2C",
      fontSize: 11,
      cursor: form.address ? "pointer" : "default",
      opacity: form.address ? 1 : 0.5
    }
  }, routeFitStatus === "loading" ? "Checking…" : "Check real route fit"), routeFitStatus && routeFitStatus !== "loading" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#8A7F6E"
    }
  }, routeFitStatus === "unavailable" ? "Add your Google Maps key under Settings → Fuel & mileage to use this." : `Closest to ${routeFitStatus.nearestName} on ${routeFitStatus.day} (${routeFitStatus.minMiles.toFixed(1)} mi).`)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "Next visit / service start date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.nextVisitDate,
    onChange: e => set("nextVisitDate", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#8A7F6E",
      marginTop: 3
    }
  }, "Leave blank to start on their regular day right away. Set a future date to hold them off the route until then.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.frequency,
    onChange: e => {
      const freq = e.target.value;
      setForm(prev => ({
        ...prev,
        frequency: freq,
        nextVisitDate: prev.nextVisitDate || (freq !== "Weekly" ? nearestUpcomingWeekday(prev.day) : "")
      }));
    },
    style: inputStyle
  }, SERVICE_INTERVALS.map(f => /*#__PURE__*/React.createElement("option", {
    key: f,
    value: f
  }, f))), /*#__PURE__*/React.createElement("input", {
    placeholder: "Price per visit ($)",
    type: "number",
    value: form.price,
    onChange: e => set("price", e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("input", {
    placeholder: "Property square footage",
    type: "number",
    value: form.sqft,
    onChange: e => set("sqft", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "Birthday (optional)"), /*#__PURE__*/React.createElement(BirthdayInput, {
    value: form.birthday,
    onChange: v => set("birthday", v),
    inputStyle: inputStyle
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438"
    }
  }, error), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    disabled: saving,
    style: {
      flex: 1,
      padding: "10px",
      borderRadius: 8,
      border: "none",
      background: "#5C7A3E",
      color: "#fff",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer"
    }
  }, saving ? "Saving…" : "Save client"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      background: "#fff",
      color: "#5C5346",
      fontSize: 13,
      cursor: "pointer"
    }
  }, "Cancel")));
}
function EditClientForm({
  client,
  onClose
}) {
  const {
    updateClient,
    removeClient
  } = useClients();
  const [form, setForm] = useState({
    name: client.name || "",
    address: client.address || "",
    cluster: client.cluster || "Edmond",
    state: client.state || "OK",
    zip: client.zip || "",
    day: client.day || "Monday",
    frequency: client.frequency || "Weekly",
    nextVisitDate: client.nextVisitDate || (client.frequency && client.frequency !== "Weekly" ? nearestUpcomingWeekday(client.day) : ""),
    price: client.price ?? "",
    status: client.status || "active",
    phone: client.phone || "",
    email: client.email || "",
    birthday: client.birthday || "",
    sqft: client.sqft ?? "",
    signupDate: client.signupDate || "",
    note: client.note || ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const set = (k, v) => setForm(prev => ({
    ...prev,
    [k]: v
  }));
  const handleSave = async () => {
    if (!form.name || !form.address) {
      setError("Name and address are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateClient(client.id, {
        name: form.name,
        address: form.address,
        cluster: form.cluster,
        state: form.state,
        zip: form.zip,
        day: form.day,
        frequency: form.frequency,
        nextVisitDate: form.nextVisitDate,
        price: form.price === "" ? null : Number(form.price),
        status: form.status,
        phone: form.phone,
        email: form.email,
        birthday: form.birthday,
        sqft: form.sqft === "" ? null : Number(form.sqft),
        signupDate: form.signupDate,
        note: form.note
      });
      onClose();
    } catch (e) {
      setError("Couldn't save — try again.");
      setSaving(false);
    }
  };
  const handleRemove = async () => {
    await removeClient(client.id);
    onClose();
  };
  const inputStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    border: "1px solid #DDD3BC",
    fontSize: 13,
    fontFamily: "inherit",
    background: "#fff",
    color: "#2A2620"
  };
  const labelStyle = {
    fontSize: 11,
    color: "#8A7F6E",
    marginBottom: 3
  };
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 14,
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      background: "#FBF3DE",
      border: "1px solid #E9D9A8"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 14,
      color: "#2A2620"
    }
  }, "Edit ", client.name), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    value: form.name,
    onChange: e => set("name", e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Address"), /*#__PURE__*/React.createElement("input", {
    value: form.address,
    onChange: e => set("address", e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "City"), /*#__PURE__*/React.createElement("select", {
    value: form.cluster,
    onChange: e => set("cluster", e.target.value),
    style: inputStyle
  }, ["Edmond", "Choctaw", "Moore", "Spencer"].map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Status"), /*#__PURE__*/React.createElement("select", {
    value: form.status,
    onChange: e => set("status", e.target.value),
    style: inputStyle
  }, ["active", "as-needed", "pending", "inactive", "lost"].map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "State"), /*#__PURE__*/React.createElement("input", {
    value: form.state,
    onChange: e => set("state", e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Zip code"), /*#__PURE__*/React.createElement("input", {
    value: form.zip,
    onChange: e => set("zip", e.target.value),
    style: inputStyle
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Day"), /*#__PURE__*/React.createElement("select", {
    value: form.day,
    onChange: e => set("day", e.target.value),
    style: inputStyle
  }, [...ROUTE_DAYS, ...WEEKEND_DAYS, "As-needed", "—"].map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Service interval"), /*#__PURE__*/React.createElement("select", {
    value: form.frequency,
    onChange: e => {
      const freq = e.target.value;
      setForm(prev => ({
        ...prev,
        frequency: freq,
        nextVisitDate: prev.nextVisitDate || (freq !== "Weekly" ? nearestUpcomingWeekday(prev.day) : "")
      }));
    },
    style: inputStyle
  }, SERVICE_INTERVALS.map(f => /*#__PURE__*/React.createElement("option", {
    key: f,
    value: f
  }, f)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Next visit / service start date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.nextVisitDate,
    onChange: e => set("nextVisitDate", e.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#8A7F6E",
      marginTop: 3
    }
  }, "Leave blank to keep them due on their regular day right away. Set a future date to hold them off the route until then.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Price per visit ($)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: form.price,
    onChange: e => set("price", e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Property square footage"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "e.g. 7500",
    value: form.sqft,
    onChange: e => set("sqft", e.target.value),
    style: inputStyle
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #E9D9A8",
      paddingTop: 10,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#2A2620",
      marginBottom: 8
    }
  }, "Contact & links"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Phone"), /*#__PURE__*/React.createElement("input", {
    placeholder: "405-555-0100",
    value: form.phone,
    onChange: e => set("phone", e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    placeholder: "name@email.com",
    value: form.email,
    onChange: e => set("email", e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Birthday"), /*#__PURE__*/React.createElement(BirthdayInput, {
    value: form.birthday,
    onChange: v => set("birthday", v),
    inputStyle: inputStyle
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: labelStyle
  }, "Notes"), /*#__PURE__*/React.createElement("textarea", {
    rows: 2,
    value: form.note,
    onChange: e => set("note", e.target.value),
    style: {
      ...inputStyle,
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #E9D9A8",
      paddingTop: 10,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(LawnPlanUpload, {
    client: client
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438"
    }
  }, error), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    disabled: saving,
    style: {
      flex: 1,
      padding: "10px",
      borderRadius: 8,
      border: "none",
      background: "#5C7A3E",
      color: "#fff",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer"
    }
  }, saving ? "Saving…" : "Save changes"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      background: "#fff",
      color: "#5C5346",
      fontSize: 13,
      cursor: "pointer"
    }
  }, "Cancel")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #E9D9A8",
      paddingTop: 10,
      marginTop: 2
    }
  }, !confirmingRemove ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmingRemove(true),
    style: {
      width: "100%",
      padding: "8px",
      borderRadius: 8,
      border: "1px solid #A65438",
      background: "#fff",
      color: "#A65438",
      fontSize: 12,
      cursor: "pointer"
    }
  }, "Remove client") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#A65438"
    }
  }, "Remove ", client.name, " entirely? This can't be undone here."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleRemove,
    style: {
      flex: 1,
      padding: "8px",
      borderRadius: 8,
      border: "none",
      background: "#A65438",
      color: "#fff",
      fontSize: 12,
      cursor: "pointer"
    }
  }, "Yes, remove"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmingRemove(false),
    style: {
      padding: "8px 14px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      background: "#fff",
      color: "#5C5346",
      fontSize: 12,
      cursor: "pointer"
    }
  }, "Cancel")))));
}
function AccountStatus({
  client
}) {
  const [pastDue, setPastDue] = useState(null);
  const [hasHistory, setHasHistory] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(`payment-log:${client.id}`, true);
        const log = result && result.value ? JSON.parse(result.value) : [];
        // Entries with no `paid` field predate this feature — treated as settled,
        // not flagged past due. Only explicitly paid:false entries count as pending.
        const unpaid = log.filter(e => e.paid === false).reduce((sum, e) => sum + (e.amount || 0), 0);
        if (!cancelled) {
          setPastDue(unpaid);
          setHasHistory(log.length > 0);
        }
      } catch (e) {
        if (!cancelled) {
          setPastDue(0);
          setHasHistory(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id]);
  if (pastDue === null || !hasHistory) return null;
  if (pastDue > 0) {
    return /*#__PURE__*/React.createElement(Pill, {
      color: "#A65438"
    }, "Past due: ", fmt(pastDue));
  }
  return /*#__PURE__*/React.createElement(Pill, {
    color: "#5C7A3E"
  }, "Acct current");
}
// ---------- OTHER SERVICES (one-time, dated add-ons that show on the day they're scheduled) ----------

// Weed Control and Post Emergent are priced identically (same treatment, same price table) but kept
// as separate selectable line items since they're billed and logged separately in practice.
const OTHER_SERVICES = [{
  id: "aeration",
  label: "Aeration",
  priceKey: "aeration"
}, {
  id: "overseed",
  label: "Overseeding",
  priceKey: "overseed"
}, {
  id: "fert",
  label: "Monthly Fertilization",
  priceKey: "fert"
}, {
  id: "weed-control",
  label: "Weed Control",
  priceKey: "weed-post"
}, {
  id: "weed-pre",
  label: "Pre-Emergent",
  priceKey: "weed-pre"
}, {
  id: "post-emergent",
  label: "Post Emergent",
  priceKey: "weed-post"
}, {
  id: "dethatch",
  label: "Dethatching",
  priceKey: "dethatch"
}];
// Continuous per-sqft pricing for Other Services, calibrated against OKC-metro market
// research (Aug 2026): a minimum/floor fee for small lots (matches real trip-charge
// minimums competitors use) plus a linear per-sqft rate beyond that, rather than
// snapping to discrete Small/Medium/Large buckets.
const SQFT_ADDON_RATES = {
  aeration: {
    min: 105,
    rate: 0.021
  },
  overseed: {
    min: 175,
    rate: 0.0475
  },
  fert: {
    min: 95,
    rate: 0.022
  },
  "weed-pre": {
    min: 60,
    rate: 0.012
  },
  "weed-post": {
    min: 60,
    rate: 0.012
  },
  dethatch: {
    min: 175,
    rate: 0.055
  }
};
function otherServicePrice(service, client) {
  if (!client.sqft || client.sqft <= 0) return null;
  const config = SQFT_ADDON_RATES[service.priceKey];
  if (!config) return null;
  return Math.round(Math.max(config.min, config.rate * client.sqft) * 100) / 100;
}
// Maps a free-text lawn plan task (e.g. "Spring Green-Up Fertiliser") to one of the
// billable services above, by keyword. Deliberately conservative: anything that doesn't
// clearly match returns null and gets treated as advice-only rather than guessing a
// price onto homeowner guidance like "Water 1.5 Inches Per Week" or "Monitor for Disease".
// Note the British spelling ("Fertiliser") that MeasureLawn's PDFs actually use.
const TASK_SERVICE_KEYWORDS = [{
  patterns: ["dethatch"],
  serviceId: "dethatch"
}, {
  patterns: ["aerat"],
  serviceId: "aeration"
}, {
  patterns: ["overseed", "over-seed"],
  serviceId: "overseed"
}, {
  patterns: ["fertilis", "fertiliz"],
  serviceId: "fert"
}, {
  patterns: ["pre-emergent", "preemergent"],
  serviceId: "weed-pre"
}, {
  patterns: ["post-emergent", "postemergent", "weed control"],
  serviceId: "weed-control"
}];
function matchTaskToService(taskText) {
  const lower = (taskText || "").toLowerCase();
  for (const entry of TASK_SERVICE_KEYWORDS) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return OTHER_SERVICES.find(s => s.id === entry.serviceId) || null;
    }
  }
  return null;
}
// Splits a month's tasks into billable (with an auto-calculated price) and advice-only.
function classifyLawnPlanTasks(tasks, client) {
  return (tasks || []).map(t => {
    const service = matchTaskToService(t);
    const price = service ? otherServicePrice(service, client) : null;
    return {
      // `text` is normalized for display/messaging; `rawText` preserves the original
      // so selection state and stored records still match what came out of the PDF.
      text: normalizeTaskText(t),
      rawText: t,
      service,
      price,
      // A task can match a real service but still have no price if the client has no
      // square footage on file — that's a "needs sqft" state, not homeowner advice,
      // and shouldn't be silently lumped in with the unbillable items.
      needsSqft: !!service && price == null
    };
  });
}
// The Review form's recommendation dropdowns use ADD_ONS ids, which mostly match
// OTHER_SERVICES but not entirely — "weed-control" there is "weed-post" here.
const OTHER_TO_ADDON_ID = {
  "weed-control": "weed-post"
};
// Pulls the client's upcoming plan tasks (nearest month first, within ~120 days so a
// visit review can look further ahead than the 45-day quote window) and returns billable
// service ids in priority order — soonest month first, and within a month in the order
// the PDF listed them. Feeds the Primary/Secondary/Tertiary defaults.
async function getPlanRecommendationIds(client, withinDays = 120) {
  try {
    const [planResult, declinesResult, soldResult] = await Promise.all([window.storage.get(`lawn-plan:${client.id}`, true), window.storage.get(`lawn-plan-declines:${client.id}`, true).catch(() => null), window.storage.get(`lawn-plan-sold:${client.id}`, true).catch(() => null)]);
    if (!planResult || !planResult.value) return [];
    const plan = JSON.parse(planResult.value);
    const declines = declinesResult && declinesResult.value ? JSON.parse(declinesResult.value) : [];
    const sold = soldResult && soldResult.value ? JSON.parse(soldResult.value) : [];
    const excluded = [...declines.map(d => `${d.month}-${d.year}`), ...sold.map(s => `${s.month}-${s.year}`)];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Collect every in-window month with its distance, so they can be ranked by date.
    const monthsInRange = [];
    MONTH_NAMES.forEach((name, idx) => {
      const tasks = plan.months[name];
      if (!tasks || tasks.length === 0) return;
      const due = nearestMonthOccurrence(idx, today);
      const daysUntil = Math.round((due - today) / 86400000);
      if (daysUntil < 0 || daysUntil > withinDays) return;
      if (excluded.includes(`${name}-${due.getFullYear()}`)) return;
      monthsInRange.push({
        name,
        tasks,
        daysUntil
      });
    });
    monthsInRange.sort((a, b) => a.daysUntil - b.daysUntil);
    const ids = [];
    monthsInRange.forEach(m => {
      m.tasks.forEach(t => {
        const service = matchTaskToService(t);
        if (!service) return; // advice-only task, not something to recommend
        const addonId = OTHER_TO_ADDON_ID[service.id] || service.id;
        if (!ids.includes(addonId)) ids.push(addonId);
      });
    });
    return ids;
  } catch (e) {
    return []; // no plan uploaded, or unreadable — dropdowns just stay empty
  }
}
async function getScheduledServices(clientId) {
  try {
    const result = await window.storage.get(`scheduled-services:${clientId}`, true);
    return result && result.value ? JSON.parse(result.value) : [];
  } catch (e) {
    return [];
  }
}
async function addScheduledService(clientId, entry) {
  const existing = await getScheduledServices(clientId);
  const next = [...existing, entry];
  await window.storage.set(`scheduled-services:${clientId}`, JSON.stringify(next), true);
  return next;
}
// Scheduling a service is what "closes" a lawn plan quote — rather than a separate
// "mark sold" step, booking the work is treated as winning it. Marks the current plan
// month sold so its badge clears and attention rolls to the next upcoming month.
async function markLawnPlanSold(clientId, serviceLabel) {
  try {
    const planResult = await window.storage.get(`lawn-plan:${clientId}`, true);
    if (!planResult || !planResult.value) return false;
    const plan = JSON.parse(planResult.value);
    const declinesResult = await window.storage.get(`lawn-plan-declines:${clientId}`, true).catch(() => null);
    const declines = declinesResult && declinesResult.value ? JSON.parse(declinesResult.value) : [];
    const soldResult = await window.storage.get(`lawn-plan-sold:${clientId}`, true).catch(() => null);
    const sold = soldResult && soldResult.value ? JSON.parse(soldResult.value) : [];
    const excluded = [...declines.map(d => `${d.month}-${d.year}`), ...sold.map(s => `${s.month}-${s.year}`)];
    const current = getUpcomingLawnPlanTasks(plan, 45, new Date(), excluded);
    if (!current) return false;
    const updated = [...sold, {
      month: current.month,
      year: current.year,
      soldService: serviceLabel,
      soldOn: localDateISO()
    }];
    await window.storage.set(`lawn-plan-sold:${clientId}`, JSON.stringify(updated), true);
    return true;
  } catch (e) {
    // scheduling itself already succeeded — this bookkeeping is best-effort
    return false;
  }
}
function OtherServicesButton({
  client,
  onScheduled
}) {
  const {
    updateClient
  } = useClients();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(null); // the OTHER_SERVICES entry chosen, awaiting a date
  const [date, setDate] = useState("");
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState(null);
  // Same accordion overflow:hidden clipping issue as the Plan/Reschedule menus — this
  // dropdown is measured and rendered fixed so it can't be cut off by the card edge.
  const btnRef = useRef(null);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0
  });
  const openMenu = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 220;
      const menuHeight = 250;
      const openUpward = rect.top > menuHeight + 10;
      const top = openUpward ? Math.max(8, rect.top - menuHeight - 6) : rect.bottom + 6;
      let left = rect.left;
      const maxLeft = window.innerWidth - menuWidth - 8;
      if (left > maxLeft) left = Math.max(8, maxLeft);
      if (left < 8) left = 8;
      setMenuPos({
        top,
        left
      });
    }
    setOpen(o => !o);
  };
  const handleConfirm = async () => {
    if (!date) {
      setError("Pick a date first.");
      return;
    }
    setError(null);
    try {
      await addScheduledService(client.id, {
        entryId: `${Date.now()}`,
        serviceId: picked.id,
        label: picked.label,
        price: otherServicePrice(picked, client),
        date
      });
      // Booking the work closes out the current lawn plan quote for this client.
      await markLawnPlanSold(client.id, picked.label);
      // Confirmation for the customer, logged verbatim so both sides have the record.
      const price = otherServicePrice(picked, client);
      const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      });
      const stamp = new Date().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
      const confirmMsg = `Hi ${client.name.split(" ")[0]}, you're all set! I've got your ${picked.label} scheduled for ${dateLabel}${price != null ? ` at ${fmt(price)}` : ""}. I'll send a reminder as it gets closer. Thanks so much for the business!`;
      const noteLine = `[${stamp}] Approved & scheduled ${picked.label} for ${dateLabel}${price != null ? ` — ${fmt(price)}` : ""}\n  ↳ Sent: "${confirmMsg}"`;
      const updatedNote = client.note ? `${client.note}\n${noteLine}` : noteLine;
      await updateClient(client.id, {
        note: updatedNote
      }).catch(() => {
        // scheduling already saved — the note is a convenience, not critical
      });
      await navigator.clipboard.writeText(confirmMsg).catch(() => {
        // clipboard unavailable — the note still holds the message text
      });
      setApplied(true);
      setPicked(null);
      setDate("");
      setOpen(false);
      setTimeout(() => setApplied(false), 2000);
      if (onScheduled) onScheduled();
    } catch (e) {
      setError("Couldn't schedule — try again.");
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      width: 52
    }
  }, /*#__PURE__*/React.createElement("button", {
    ref: btnRef,
    onClick: () => {
      openMenu();
      setPicked(null);
      setError(null);
    },
    title: "Schedule another service",
    "aria-label": "Schedule another service",
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      background: applied ? "#5C7A3E" : "#8A6A1C",
      flexShrink: 0
    }
  }, applied ? /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 15
  }) : /*#__PURE__*/React.createElement(Star, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, applied ? "Scheduled ✓" : "Other"), open && !picked && /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setPicked(null);
      setError(null);
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 190
    }
  }), open && !picked && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: menuPos.top,
      left: menuPos.left,
      zIndex: 200,
      background: "#fff",
      border: "1px solid #DDD3BC",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      width: 220,
      maxHeight: "70vh",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      fontSize: 10,
      color: "#8A7F6E",
      borderBottom: "1px solid #E9E1CC",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, "Schedule a service"), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setPicked(null);
      setError(null);
    },
    "aria-label": "Close",
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: "#8A7F6E",
      fontSize: 15,
      lineHeight: 1,
      flexShrink: 0
    }
  }, "\u00D7")), !client.sqft ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 12px",
      fontSize: 11,
      color: "#8A7F6E"
    }
  }, "Add this client's property square footage (via Edit) so prices can be calculated.") : OTHER_SERVICES.map(service => {
    const price = otherServicePrice(service, client);
    return /*#__PURE__*/React.createElement("button", {
      key: service.id,
      onClick: () => setPicked(service),
      style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "9px 12px",
        border: "none",
        borderBottom: "1px solid #E9E1CC",
        background: "#fff",
        cursor: "pointer",
        fontSize: 12,
        color: "#2A2620"
      }
    }, service.label, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: "#8A7F6E",
        marginTop: 2
      }
    }, price != null ? fmt(price) : "—"));
  })), open && picked && /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setPicked(null);
      setError(null);
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 190
    }
  }), open && picked && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: menuPos.top,
      left: menuPos.left,
      zIndex: 200,
      background: "#fff",
      border: "1px solid #DDD3BC",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      width: 220,
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "#2A2620"
    }
  }, picked.label, " — ", fmt(otherServicePrice(picked, client))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E"
    }
  }, "Complete on:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value),
    style: {
      width: "100%",
      padding: "7px 8px",
      borderRadius: 6,
      border: "1px solid #DDD3BC",
      fontSize: 12,
      fontFamily: "inherit"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleConfirm,
    style: {
      flex: 1,
      padding: "7px 10px",
      borderRadius: 6,
      border: "none",
      background: "#3E5C2C",
      color: "#fff",
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 600,
      cursor: "pointer"
    }
  }, "Schedule"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPicked(null),
    style: {
      padding: "7px 10px",
      borderRadius: 6,
      border: "1px solid #DDD3BC",
      background: "#fff",
      color: "#5C5346",
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      cursor: "pointer"
    }
  }, "Back")), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#A65438"
    }
  }, error)));
}

// ---------- SEND CONFIRMATION (tells a pending client which day they're scheduled) ----------

function SendConfirmationButton({
  client
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const hasDay = client.day && client.day !== "—" && ROUTE_DAYS.includes(client.day);
  const handleClick = async () => {
    setError(null);
    const message = hasDay ? `Hi ${client.name.split(" ")[0]}, this is Nick with Mow Masters of Edmond! You're all set — we'll have you on the schedule every ${client.day}. Let us know if you have any questions!` : `Hi ${client.name.split(" ")[0]}, this is Nick with Mow Masters of Edmond! You're all set on our end — we're finalizing your route day and will follow up shortly with the exact day you'll see us.`;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Couldn't copy — try again.");
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      width: 52
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleClick,
    title: hasDay ? `Copy confirmation — scheduled ${client.day}s` : "Copy confirmation (day not yet set)",
    "aria-label": "Copy confirmation message",
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      background: copied ? "#5C7A3E" : "#2D6E5C",
      flexShrink: 0
    }
  }, copied ? /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 15
  }) : /*#__PURE__*/React.createElement(Phone, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, copied ? "Copied ✓" : "Confirm"), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#A65438"
    }
  }, error));
}
function Clients() {
  const {
    clients,
    loading
  } = useClients();
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [referrer, setReferrer] = useState(null);
  const formRef = useRef(null);
  const openReferralForm = client => {
    setReferrer({
      id: client.id,
      name: client.name
    });
    setShowAddForm(true);
    setTimeout(() => formRef.current && formRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start"
    }), 50);
  };
  if (loading) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      color: "#8A7F6E",
      fontSize: 13
    }
  }, "Loading…");
  const filtered = clients.filter(c => filter === "all" ? true : c.status === filter).filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const filters = [{
    key: "active",
    label: "Active"
  }, {
    key: "as-needed",
    label: "As-needed"
  }, {
    key: "pending",
    label: "Pending"
  }, {
    key: "inactive",
    label: "Inactive"
  }, {
    key: "all",
    label: "All"
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search clients by name…",
    value: search,
    onChange: e => setSearch(e.target.value),
    style: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 14,
      fontFamily: "inherit",
      background: "#fff",
      color: "#2A2620",
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setReferrer(null);
      setShowAddForm(s => !s);
    },
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      width: "100%",
      padding: "10px",
      borderRadius: 8,
      border: "none",
      background: showAddForm ? "#8A7F6E" : "#2D6E5C",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      marginBottom: 12
    }
  }, showAddForm ? "Close" : "+ Add client"), /*#__PURE__*/React.createElement("div", {
    ref: formRef
  }), showAddForm && /*#__PURE__*/React.createElement(AddClientForm, {
    referrer: referrer,
    onClose: () => {
      setShowAddForm(false);
      setReferrer(null);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, filters.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.key,
    onClick: () => setFilter(f.key),
    style: {
      padding: "6px 12px",
      borderRadius: 999,
      border: "1px solid #DDD3BC",
      background: filter === f.key ? "#2D4222" : "#fff",
      color: filter === f.key ? "#F2EDDD" : "#5C5346",
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace",
      cursor: "pointer"
    }
  }, f.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, filtered.map(c => {
    const isEditing = editingId === c.id;
    return /*#__PURE__*/React.createElement("div", {
      key: c.id
    }, /*#__PURE__*/React.createElement(Card, {
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: "#2A2620"
      }
    }, c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5C5346",
        marginTop: 2,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(MapPin, {
      size: 11
    }), " ", c.address, " · ", c.cluster, c.state || c.zip ? `, ${c.state || "OK"}${c.zip ? ` ${c.zip}` : ""}` : ""), c.day !== "—" && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5C5346",
        marginTop: 2,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Clock, {
      size: 11
    }), " ", c.day, c.frequency && c.frequency !== "Weekly" ? ` · ${c.frequency}` : ""), c.nextVisitDate && (() => {
      const next = nextOccurrence(c);
      if (!next) return null;
      const todayISO = localDateISO();
      const notYetStarted = c.nextVisitDate > todayISO;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: notYetStarted ? "#B58A2C" : "#2D6E5C",
          marginTop: 2
        }
      }, notYetStarted ? "Starts: " : "Next visit: ", next.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      }));
    })(), c.phone && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5C5346",
        marginTop: 2,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Phone, {
      size: 11
    }), " ", c.phone), c.email && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5C5346",
        marginTop: 2
      }
    }, c.email), (() => {
      const bday = birthdayInfo(c.birthday);
      if (!bday) return null;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          marginTop: 2,
          color: bday.soon ? "#B58A2C" : "#5C5346",
          fontWeight: bday.soon ? 700 : 400
        }
      }, "🎂 ", bday.label, bday.soon ? ` — ${bday.daysAway === 0 ? "today!" : `${bday.daysAway}d away`}` : "");
    })(), c.note && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#8A7F6E",
        marginTop: 4,
        fontStyle: "italic"
      }
    }, c.note)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Pill, {
      color: statusColor(c.status)
    }, c.status), /*#__PURE__*/React.createElement(AccountStatus, {
      client: c
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 15,
        fontWeight: 700,
        color: "#2A2620",
        marginTop: 2
      }
    }, fmt(c.price)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => openReferralForm(c),
      title: "Add referral (20% off their next bill)",
      "aria-label": "Add referral",
      style: {
        width: 22,
        height: 22,
        borderRadius: 6,
        border: "none",
        background: "#DDD3BC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Users, {
      size: 12,
      color: "#5C5346"
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => setEditingId(isEditing ? null : c.id),
      title: "Edit client",
      "aria-label": "Edit client",
      style: {
        width: 22,
        height: 22,
        borderRadius: 6,
        border: "none",
        background: isEditing ? "#5C7A3E" : "#DDD3BC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Pencil, {
      size: 12,
      color: isEditing ? "#fff" : "#5C5346"
    }))), (c.status === "active" || c.status === "as-needed") && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: "1px solid #E9E1CC"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(MorningReminder, {
      client: c
    }), /*#__PURE__*/React.createElement(VisitTimer, {
      client: c
    }), /*#__PURE__*/React.createElement(PaymentRequest, {
      client: c
    }), /*#__PURE__*/React.createElement(VisitReview, {
      client: c
    }), /*#__PURE__*/React.createElement(OtherServicesButton, {
      client: c
    }), /*#__PURE__*/React.createElement(MeasureLawnButton, {
      client: c
    }), /*#__PURE__*/React.createElement(RescheduleButton, {
      client: c
    })))), c.status === "pending" && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: "1px solid #E9E1CC",
        display: "flex",
        alignItems: "flex-start",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(SendConfirmationButton, {
      client: c
    })), isEditing && /*#__PURE__*/React.createElement(EditClientForm, {
      client: c,
      onClose: () => setEditingId(null)
    }));
  })));
}
// ---------- SERVICE CATALOG (from Price List / Add-On Services) ----------

const MOW_TIERS = [{
  id: "mow-small",
  name: "Mow, Trim & Edge — Small (<5,000 sqft)",
  weeklyPrice: 50
}, {
  id: "mow-medium",
  name: "Mow, Trim & Edge — Medium (5,000–10,000 sqft)",
  weeklyPrice: 65
}, {
  id: "mow-large",
  name: "Mow, Trim & Edge — Large (>10,000 sqft)",
  weeklyPrice: 98
}];

// Bi-weekly and one-time priced 10% above weekly to make weekly the visibly better deal
function mowPrice(weeklyPrice, frequency) {
  return frequency === "Weekly" ? weeklyPrice : Math.round(weeklyPrice * 1.1);
}

// Temperature range (°F) each add-on can safely/effectively be performed in.
// Grounded in real horticultural practice — not every service cares about temp, so only weather-sensitive ones are listed.
const TEMP_LIMITS = {
  "weed-pre": {
    min: 35,
    max: 85,
    note: "Pre-emergent breaks down fast in heat and won't bind right in near-freezing soil."
  },
  "weed-post": {
    min: 45,
    max: 88,
    note: "Post-emergent herbicide labels warn against application below ~45°F (won't absorb) or above ~88°F (turf scorch/drift risk)."
  },
  fert: {
    min: 40,
    max: 90,
    note: "Fertilizer can burn turf applied in extreme heat, and grass isn't actively feeding near freezing."
  },
  aeration: {
    min: 40,
    max: 95,
    note: "Frozen or bone-dry, baked soil doesn't pull plugs cleanly."
  },
  overseed: {
    min: 45,
    max: 90,
    note: "Seed needs soil warmth to germinate and won't take in a hard freeze or peak summer heat."
  },
  mulch: {
    min: 32,
    max: 105,
    note: "Just needs unfrozen ground to work into — otherwise no real limit."
  },
  gutter: {
    min: 34,
    max: 105,
    note: "Ladder work on an icy roofline isn't worth the risk."
  }
};
function WeatherBanner({
  temp,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#5C5346"
    }
  }, "Current temp:"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: temp === null ? "" : temp,
    onChange: e => onChange(e.target.value === "" ? null : Number(e.target.value)),
    placeholder: "°F",
    style: {
      width: 64,
      padding: "4px 8px",
      borderRadius: 6,
      border: "1px solid #DDD3BC",
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#8A7F6E"
    }
  }, "°F")), temp != null && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginTop: 3
    }
  }, "Weather-sensitive services outside their safe range are grayed out below."));
}
const ADD_ONS = [{
  id: "aeration",
  name: "Aeration",
  unit: "flat",
  flat: true,
  sizeBased: true,
  why: "Relieves soil compaction so water, air, and nutrients can actually reach the roots instead of running off. Compacted lawns thin out and stress easily even with regular mowing.",
  timing: "Best in September — grass is still actively growing and recovers fast, and it sets up overseeding to actually take root."
}, {
  id: "dethatch",
  name: "Dethatching",
  unit: "flat",
  flat: true,
  sizeBased: true,
  why: "Strips out the built-up layer of dead grass and roots sitting between the soil and living turf — thick thatch chokes off water, air, and nutrients before they ever reach the roots, leading to thin, spongy patches.",
  timing: "Best in early fall or spring while grass is actively growing and can recover quickly — pairs well with aeration and overseeding right after."
}, {
  id: "overseed",
  name: "Overseeding",
  unit: "flat",
  flat: true,
  sizeBased: true,
  why: "Fills in thin or bare patches and thickens the turf, which crowds out weeds before they get a foothold.",
  timing: "Pair with fall aeration in September — new seed falls straight into the aeration holes for much better soil contact."
}, {
  id: "fert",
  name: "Monthly Fertilization",
  unit: "flat",
  flat: true,
  sizeBased: true,
  why: "Feeds root and blade growth for better color, density, and resistance to disease and drought stress.",
  timing: "Most impactful during spring green-up and again in fall for root-hardening before dormancy — avoid heavy feeding in peak summer heat."
}, {
  id: "weed-pre",
  name: "Spring time Pre-Emergent",
  unit: "flat",
  flat: true,
  sizeBased: true,
  why: "Creates a barrier in the soil that stops weed seeds from ever germinating — it's prevention, not a cure, so it only works if it's down before weeds sprout. Targets crabgrass in spring and henbit/chickweed in fall, the two biggest weed pressures on Edmond lawns. Skipping it means fighting those weeds by hand or with post-emergent all season instead.",
  timing: "Crabgrass: apply late Feb–March, before soil hits ~55°F. Winter weeds (henbit, chickweed): apply in September, before fall germination. This is calendar-locked — miss the window and it's not worth doing until next season."
}, {
  id: "weed-post",
  name: "Weed Control",
  unit: "flat",
  flat: true,
  sizeBased: true,
  why: "Targets weeds that are already up and growing — the right move once you can actually see crabgrass, dandelion, clover, or nutsedge in the yard.",
  timing: "Not calendar-based — apply as soon as weeds are spotted. Nutsedge is most active and most treatable in July–August heat."
}, {
  id: "hedge",
  name: "Hedge / Shrub Trim",
  price: 47.5,
  unit: "hr",
  flat: false,
  why: "Keeps shape and size under control, and improves airflow through the plant — which cuts down on fungal disease risk in humid weather.",
  timing: "Late winter (Feb/Mar) is ideal — trimming before new spring growth means the plant heals and fills back in cleanly."
}, {
  id: "bed",
  name: "Bed Cleanup",
  unit: "flat",
  flat: true,
  sizeBased: true,
  why: "Stops weeds from going to seed and spreading into the lawn, and removes competition for water and nutrients around your plants.",
  timing: "Most valuable in spring (before weed season ramps up) and fall (before winter weeds germinate)."
}, {
  id: "mulch",
  name: "Mulch Install",
  price: 73,
  unit: "cubic yard",
  flat: false,
  why: "Locks in soil moisture, suppresses weeds, and moderates soil temperature so plant roots aren't stressed by heat or cold swings.",
  timing: "Spring, right after bed cleanup, gets the most benefit through the growing season — a fall refresh also protects roots over winter."
}, {
  id: "cleanup-spring",
  name: "Spring Clean-Up",
  price: 128,
  unit: "flat",
  flat: true,
  why: "Clears winter debris and dead growth so the lawn and beds start the growing season clean — catches problems early, before they spread.",
  timing: "Do this as soon as the lawn breaks dormancy, before the first regular mows of the season."
}, {
  id: "cleanup-fall",
  name: "Fall Clean-Up",
  price: 128,
  unit: "flat",
  flat: true,
  why: "Clears leaves and debris that smother grass and trap moisture against it — a major cause of fungal disease and dead patches over winter.",
  timing: "Late October through November, timed around peak leaf drop for your trees."
}, {
  id: "leaf",
  name: "Leaf Removal",
  price: 45,
  unit: "hr",
  flat: false,
  why: "A thick layer of leaves blocks sunlight and traps moisture on the grass below — even a couple weeks of cover can kill patches of lawn.",
  timing: "Most critical October–November during peak leaf drop — don't let leaves sit through a hard frost or heavy rain."
}, {
  id: "gutter",
  name: "Gutter Cleaning",
  price: 90,
  unit: "flat",
  flat: true,
  why: "Clogged gutters overflow onto beds and foundation lines, eroding soil and drowning nearby turf and plants.",
  timing: "Best right after leaf drop, before the heavier fall/winter rains hit."
}];

// Flat tier pricing for size-based add-ons. Small/Medium/Large mirror the mow-tier ratios ($50/$65/$98).
const TIER_ADDON_PRICES = {
  bed: {
    "mow-small": 70,
    "mow-medium": 90,
    "mow-large": 135
  },
  aeration: {
    "mow-small": 105,
    "mow-medium": 140,
    "mow-large": 210
  },
  overseed: {
    "mow-small": 175,
    "mow-medium": 325,
    "mow-large": 475
  },
  fert: {
    "mow-small": 95,
    "mow-medium": 150,
    "mow-large": 220
  },
  "weed-pre": {
    "mow-small": 60,
    "mow-medium": 80,
    "mow-large": 120
  },
  "weed-post": {
    "mow-small": 60,
    "mow-medium": 80,
    "mow-large": 120
  },
  dethatch: {
    "mow-small": 175,
    "mow-medium": 413,
    "mow-large": 550
  }
};

// Beyond 10,000 sqft, Large-tier flat pricing scales up per 100 sqft rather than staying capped —
// keeps big lots profitable instead of undercharging them at the same flat rate as a 10,001 sqft yard.
const LARGE_THRESHOLD_SQFT = 10000;
const INCREMENT_STEP = 100;
const INCREMENT_RATES = {
  aeration: 1.9,
  overseed: 4.0,
  fert: 0.9,
  "weed-pre": 0.5,
  "weed-post": 0.5,
  dethatch: 5.5
  // bed cleanup intentionally has no increment — labor-based, not material/sqft-based
};
function resolveSizeBasedPrice(id, mowTier, lotSqft) {
  const tierPrices = TIER_ADDON_PRICES[id];
  if (!tierPrices) return null;
  const defaultPrice = tierPrices["mow-medium"];
  if (!mowTier) return defaultPrice;
  const basePrice = tierPrices[mowTier] ?? defaultPrice;
  const rate = INCREMENT_RATES[id];
  if (mowTier === "mow-large" && rate && typeof lotSqft === "number" && lotSqft > LARGE_THRESHOLD_SQFT) {
    const extraSqft = lotSqft - LARGE_THRESHOLD_SQFT;
    const increments = extraSqft / INCREMENT_STEP;
    return Math.round((basePrice + increments * rate) * 100) / 100;
  }
  return basePrice;
}
function buildServices(frequency, mowTier, lotSqft) {
  const mowServices = MOW_TIERS.map(t => ({
    id: t.id,
    name: t.name,
    price: mowPrice(t.weeklyPrice, frequency),
    unit: "visit",
    flat: true
  }));
  const addOns = ADD_ONS.map(s => s.sizeBased ? {
    ...s,
    price: resolveSizeBasedPrice(s.id, mowTier, lotSqft)
  } : s);
  return [...mowServices, ...addOns];
}

// Static reference (used where size/frequency isn't yet known, e.g. Clients/Schedule tabs — weekly rate, medium-size bed price)
const MINIMUM_SERVICE = 50;
function computeQuote(selectedIds, frequency = "Weekly", quantities = {}, mowTier, lotSqft) {
  const catalog = buildServices(frequency, mowTier, lotSqft);
  const items = catalog.filter(s => selectedIds.includes(s.id));
  const flatTotal = items.filter(s => s.flat).reduce((sum, s) => sum + s.price, 0);
  const variableItems = items.filter(s => !s.flat);
  const variableTotal = variableItems.reduce((sum, s) => sum + s.price * (quantities[s.id] || 1), 0);
  const rawTotal = flatTotal + variableTotal;
  const minimumApplied = items.length > 0 && rawTotal < MINIMUM_SERVICE;
  const total = minimumApplied ? MINIMUM_SERVICE : rawTotal;
  return {
    items,
    variableItems,
    rawTotal,
    minimumApplied,
    total
  };
}
function MowTierSelect({
  value,
  onChange,
  frequency
}) {
  return /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange(e.target.value),
    style: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 14,
      fontFamily: "inherit",
      background: "#fff",
      color: "#2A2620"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select lawn size…"), MOW_TIERS.map(t => /*#__PURE__*/React.createElement("option", {
    key: t.id,
    value: t.id
  }, t.name, " — ", t.id === "mow-large" ? "Custom quote" : `$${mowPrice(t.weeklyPrice, frequency)}`)));
}

// Month index (0=Jan) -> which add-ons are seasonally timely right now, and why
const MONTHLY_RECOMMENDATIONS = [[],
// Jan — dormant
[{
  id: "hedge",
  reason: "prune before spring growth kicks in"
}, {
  id: "cleanup-spring",
  reason: "clear winter debris as dormancy breaks"
}],
// Feb
[{
  id: "weed-pre",
  reason: "crabgrass pre-emergent window — apply before it germinates"
}, {
  id: "cleanup-spring",
  reason: "green-up is starting, get ahead of it"
}],
// Mar
[{
  id: "fert",
  reason: "first full-strength feeding once turf is fully green"
}, {
  id: "mulch",
  reason: "beds look best refreshed heading into the growing season"
}],
// Apr
[{
  id: "weed-pre",
  reason: "second pre-emergent split for season-long crabgrass control"
}, {
  id: "fert",
  reason: "keep the spring fertility program going"
}],
// May
[],
// Jun
[{
  id: "weed-post",
  reason: "nutsedge is emerging in summer heat — spot treatment works best now"
}],
// Jul
[{
  id: "bed",
  reason: "weeds spread fast in late-summer heat — stay ahead of it"
}],
// Aug
[{
  id: "aeration",
  reason: "the single best month to relieve compaction"
}, {
  id: "overseed",
  reason: "pairs with aeration for thicker turf next spring"
}, {
  id: "weed-pre",
  reason: "fall pre-emergent stops henbit & chickweed before they start"
}],
// Sep
[{
  id: "fert",
  reason: "winterizer feeding hardens roots before dormancy"
}, {
  id: "leaf",
  reason: "peak leaf drop is starting"
}],
// Oct
[{
  id: "cleanup-fall",
  reason: "clear the yard before hard frost hits"
}, {
  id: "leaf",
  reason: "don't let leaves smother the lawn over winter"
}, {
  id: "gutter",
  reason: "clean before winter rains back up"
}],
// Nov
[] // Dec
];
function getUpcomingRecommendations(date = new Date()) {
  const months = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
    months.push({
      monthIndex: d.getMonth(),
      monthName: d.toLocaleString("en-US", {
        month: "long"
      }),
      items: MONTHLY_RECOMMENDATIONS[d.getMonth()]
    });
  }
  return months;
}
function AddOnButtons({
  selected,
  onToggle,
  quantities,
  onQuantityChange,
  weedTypes,
  onToggleWeedType,
  recommendedIds,
  frequency,
  mowTier,
  currentTemp,
  lotSqft
}) {
  const [expanded, setExpanded] = useState([]);
  const resolvedAddOns = buildServices(frequency, mowTier, lotSqft).filter(s => ADD_ONS.some(a => a.id === s.id));
  const toggleInfo = id => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const isOutOfTempRange = id => {
    const limit = TEMP_LIMITS[id];
    if (!limit || currentTemp == null) return false;
    return currentTemp < limit.min || currentTemp > limit.max;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, resolvedAddOns.map(s => {
    const isChecked = selected.includes(s.id);
    const isInfoOpen = expanded.includes(s.id);
    const isRecommended = recommendedIds && recommendedIds.includes(s.id);
    const blocked = isOutOfTempRange(s.id) && !isChecked;
    return /*#__PURE__*/React.createElement("div", {
      key: s.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => !blocked && onToggle(s.id),
      disabled: blocked,
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        padding: "9px 12px",
        borderRadius: 8,
        border: `1px solid ${blocked ? "#E9E1CC" : isChecked ? "#5C7A3E" : isRecommended ? "#B58A2C" : "#DDD3BC"}`,
        background: blocked ? "#F2EEE2" : isChecked ? "#5C7A3E" : isRecommended ? "#FBF3DE" : "#fff",
        color: blocked ? "#B0A98F" : isChecked ? "#fff" : "#2A2620",
        fontSize: 13,
        fontFamily: "inherit",
        cursor: blocked ? "not-allowed" : "pointer",
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, isRecommended && !isChecked && !blocked && /*#__PURE__*/React.createElement(Star, {
      size: 11,
      fill: "#B58A2C",
      color: "#B58A2C"
    }), s.name, blocked && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10
      }
    }, "(too ", currentTemp < TEMP_LIMITS[s.id].min ? "cold" : "hot", " right now)")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        color: blocked ? "#B0A98F" : isChecked ? "#F2EDDD" : "#B5602F",
        flexShrink: 0
      }
    }, mowTier === "mow-large" ? "Custom quote" : `$${s.price}${s.flat ? "" : `/${s.unit}`}`)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => toggleInfo(s.id),
      "aria-label": `Why ${s.name} matters`,
      style: {
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: 8,
        border: `1px solid ${isInfoOpen ? "#B58A2C" : "#DDD3BC"}`,
        background: isInfoOpen ? "#F5E6C4" : "#fff",
        color: isInfoOpen ? "#8A6A1C" : "#8A7F6E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Info, {
      size: 16
    }))), isInfoOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        padding: "10px 12px",
        borderRadius: 8,
        background: "#FBF3DE",
        border: "1px solid #E9D9A8",
        fontSize: 12,
        color: "#5C4E2E",
        lineHeight: 1.5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: "#2A2620"
      }
    }, "Why it matters: "), s.why), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: "#2A2620"
      }
    }, "Best timing: "), s.timing), TEMP_LIMITS[s.id] && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: "#2A2620"
      }
    }, "Temperature window: "), TEMP_LIMITS[s.id].min, "°–", TEMP_LIMITS[s.id].max, "°F. ", TEMP_LIMITS[s.id].note)), !s.flat && isChecked && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 10px",
        background: "#F0EBD8",
        borderRadius: 8,
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#5C5346"
      }
    }, "How many ", s.unit, "?"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onQuantityChange(s.id, Math.max(1, (quantities[s.id] || 1) - 1)),
      style: {
        width: 22,
        height: 22,
        borderRadius: 6,
        border: "1px solid #DDD3BC",
        background: "#fff",
        cursor: "pointer",
        fontSize: 14,
        lineHeight: 1
      }
    }, "−"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        minWidth: 20,
        textAlign: "center"
      }
    }, quantities[s.id] || 1), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onQuantityChange(s.id, (quantities[s.id] || 1) + 1),
      style: {
        width: 22,
        height: 22,
        borderRadius: 6,
        border: "1px solid #DDD3BC",
        background: "#fff",
        cursor: "pointer",
        fontSize: 14,
        lineHeight: 1
      }
    }, "+"))), s.id === "weed-post" && isChecked && /*#__PURE__*/React.createElement(WeedTypeSelect, {
      selected: weedTypes,
      onToggle: onToggleWeedType
    }));
  }));
}
function QuoteSummary({
  selected,
  frequency,
  quantities,
  mowTier,
  lotSqft
}) {
  const {
    items,
    rawTotal,
    minimumApplied,
    total
  } = computeQuote(selected, frequency, quantities, mowTier, lotSqft);
  if (items.length === 0) return null;
  if (mowTier === "mow-large") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 12px",
        borderRadius: 8,
        background: "#F0EBD8",
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "#2A2620"
      }
    }, "Custom quote needed"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#5C5346",
        marginTop: 4
      }
    }, "Properties over 10,000 sqft are priced on-site — submit your info below and Mow Masters will text you back with pricing."));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 12px",
      borderRadius: 8,
      background: "#F0EBD8",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5C5346"
    }
  }, "Estimated quote"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      fontSize: 15,
      color: "#2A2620"
    }
  }, fmt(total))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginTop: 4
    }
  }, "Per-unit services (aeration, hedge trim, mulch, etc.) use the quantity you set above — confirm exact sqft/hours on-site."), minimumApplied && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginTop: 4
    }
  }, "$", MINIMUM_SERVICE, " minimum service applied (items totaled $", rawTotal.toFixed(2), ")."));
}
const FREQUENCIES = ["One-time", "Weekly", "Bi-weekly"];
const GRASS_TYPES = ["Bermudagrass", "Zoysiagrass", "Buffalograss", "Tall Fescue", "Kentucky Bluegrass", "St. Augustinegrass", "Mixed / Unknown"];
const WEED_TYPES = ["Crabgrass", "Dallisgrass", "Nutsedge (yellow/purple)", "Dandelion", "White Clover", "Henbit", "Common Chickweed", "Not sure — need it identified"];
// Things you can see standing on the lawn that point to a specific service.
const TURF_CONDITIONS = ["Thin / bare spots", "Spongy underfoot (thatch)", "Hard, compacted soil", "Water pooling or running off", "Yellowing / pale color", "Heavy foot or pet traffic", "Looks healthy overall"];

// ---------- RECOMMENDATION RANKING ----------
// Seasonal windows for Edmond, OK (USDA 7a, warm-season Bermuda), per OSU Extension
// and OK-specific commercial sources. Months are 1-indexed.
//   Pre-emergent runs TWICE a year and the two applications target different weeds:
//     spring (Jan–early Mar, before soil hits 55°F) stops SUMMER annuals — crabgrass,
//     goosegrass, foxtail; fall (late Aug–mid Sep) stops WINTER annuals — poa annua,
//     henbit, chickweed. Seeing crabgrass in the fall does NOT call for pre-emergent;
//     it's already germinated, so that's a post-emergent job.
//   Aeration and overseeding need active growth to recover, which for Bermuda here
//     means late spring through early summer, not fall.
//   Dethatching follows OSU Extension: February–March, prior to spring green-up, is
//     best for warm-season lawns, and only when thatch exceeds 1/2". (Many commercial
//     sources say May–June instead; OSU is the authority followed here.)
const SERVICE_WINDOWS = {
  "weed-pre": [1, 2, 3, 8, 9],
  "weed-post": [3, 4, 5, 6, 7, 8, 9, 10],
  fert: [4, 5, 6, 7, 8, 9],
  aeration: [5, 6, 7],
  dethatch: [2, 3],
  overseed: [5, 6],
  hedge: [3, 4, 5, 6, 7, 8, 9, 10],
  bed: [3, 4, 5, 6, 7, 8, 9, 10]
};
// Weeds split by lifecycle, because that decides pre- vs post-emergent.
const SUMMER_ANNUAL_WEEDS = ["Crabgrass", "Dallisgrass"];
const WINTER_ANNUAL_WEEDS = ["Henbit", "Common Chickweed"];
const BROADLEAF_WEEDS = ["Dandelion", "White Clover"];
function inWindow(serviceId, month) {
  const w = SERVICE_WINDOWS[serviceId];
  return !w || w.includes(month);
}
// Scores each service from what was observed on the lawn, gated by whether the service
// is even appropriate this month. Higher score = higher priority.
function scoreServicesFromObservations({
  weeds = [],
  conditions = [],
  month
}) {
  const scores = {};
  const bump = (id, points) => {
    scores[id] = (scores[id] || 0) + points;
  };
  const sawSummerAnnual = weeds.some(w => SUMMER_ANNUAL_WEEDS.includes(w));
  const sawWinterAnnual = weeds.some(w => WINTER_ANNUAL_WEEDS.includes(w));
  const sawBroadleaf = weeds.some(w => BROADLEAF_WEEDS.includes(w));
  // Spring pre-emergent prevents next season's summer annuals — relevant precisely
  // because you saw them this year.
  if (sawSummerAnnual && [1, 2, 3].includes(month)) bump("weed-pre", 100);
  // Fall pre-emergent targets WINTER annuals only. Seeing a summer annual like
  // crabgrass in August must not trigger this — it's already germinated, so the
  // fall application does nothing for it and post-emergent is the right call.
  // Weighted above post-emergent here because the fall window is narrow and
  // preventing the next flush beats treating the current one.
  if (sawWinterAnnual && [8, 9].includes(month)) bump("weed-pre", 110);
  // Anything already visible is a post-emergent job, whatever the season.
  if (sawSummerAnnual || sawBroadleaf || sawWinterAnnual) bump("weed-post", 95);
  if (sawBroadleaf) bump("weed-post", 10);
  conditions.forEach(c => {
    if (c === "Thin / bare spots") {
      bump("overseed", 80);
      bump("fert", 40);
    }
    if (c === "Spongy underfoot (thatch)") bump("dethatch", 90);
    if (c === "Hard, compacted soil") bump("aeration", 90);
    if (c === "Water pooling or running off") bump("aeration", 85);
    if (c === "Yellowing / pale color") bump("fert", 90);
    if (c === "Heavy foot or pet traffic") bump("aeration", 60);
  });
  return scores;
}
// Final ordering: observation score first (gated by seasonal window), then the client's
// lawn plan order, then everything else. Declined services sink; sold ones are excluded
// upstream. Returns service ids, highest priority first.
function rankRecommendations({
  weeds = [],
  conditions = [],
  planIds = [],
  declinedIds = [],
  month = new Date().getMonth() + 1
}) {
  const scores = scoreServicesFromObservations({
    weeds,
    conditions,
    month
  });
  const candidates = new Set([...Object.keys(scores), ...planIds]);
  const ranked = [...candidates].map(id => {
    let score = scores[id] || 0;
    // Out-of-window services are heavily penalized — a fall dethatch or a June
    // pre-emergent is the wrong call no matter what the lawn looks like.
    if (!inWindow(id, month)) score -= 200;
    // Plan order contributes a small, decaying bonus so it breaks ties without
    // overriding what was actually observed.
    const planIdx = planIds.indexOf(id);
    if (planIdx >= 0) score += Math.max(0, 30 - planIdx * 5);
    if (declinedIds.includes(id)) score -= 50;
    return {
      id,
      score
    };
  })
  // Drop anything that's both out of season and unsupported by observations.
  .filter(x => x.score > -100).sort((a, b) => b.score - a.score);
  return ranked.map(x => x.id);
}
function CheckboxColumn({
  options,
  selected,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, options.map(opt => {
    const isChecked = selected.includes(opt);
    return /*#__PURE__*/React.createElement("label", {
      key: opt,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: "#2A2620",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: isChecked,
      onChange: () => onToggle(opt),
      style: {
        width: 15,
        height: 15,
        accentColor: "#5C7A3E",
        flexShrink: 0
      }
    }), opt);
  }));
}
function RecommendationSelect({
  label,
  value,
  onChange,
  excluded,
  status,
  onStatusChange,
  client
}) {
  const catalog = buildServices("Weekly", null); // resolves bed cleanup to its default display price
  const options = catalog.filter(s => ADD_ONS.some(a => a.id === s.id) && (!excluded.includes(s.id) || s.id === value));
  const selectedService = catalog.find(s => s.id === value);
  // Prices come from the client's actual square footage where we can compute them —
  // the generic catalog price is only a fallback for services with no sqft rate (or
  // when the client has no sqft on file yet).
  const priceFor = s => {
    if (client) {
      const otherId = Object.keys(OTHER_TO_ADDON_ID).find(k => OTHER_TO_ADDON_ID[k] === s.id);
      const other = OTHER_SERVICES.find(o => o.id === (otherId || s.id));
      if (other) {
        const sqftPrice = otherServicePrice(other, client);
        if (sqftPrice != null) return `$${sqftPrice.toFixed(2)}`;
      }
    }
    return `$${s.price}${s.flat ? "" : `/${s.unit}`}`;
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, label), /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange(e.target.value),
    style: {
      width: "100%",
      padding: "8px 10px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 13,
      fontFamily: "inherit",
      background: "#fff",
      color: "#2A2620"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "None"), options.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.name, " — ", priceFor(s)))), selectedService && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onStatusChange(status === "accepted" ? null : "accepted"),
    style: {
      padding: "4px 10px",
      borderRadius: 999,
      border: `1px solid ${status === "accepted" ? "#5C7A3E" : "#DDD3BC"}`,
      background: status === "accepted" ? "#5C7A3E" : "#fff",
      color: status === "accepted" ? "#fff" : "#5C5346",
      fontSize: 11,
      cursor: "pointer"
    }
  }, "✓ Accept"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onStatusChange(status === "declined" ? null : "declined"),
    style: {
      padding: "4px 10px",
      borderRadius: 999,
      border: `1px solid ${status === "declined" ? "#A65438" : "#DDD3BC"}`,
      background: status === "declined" ? "#A65438" : "#fff",
      color: status === "declined" ? "#fff" : "#5C5346",
      fontSize: 11,
      cursor: "pointer"
    }
  }, "✗ Decline"), status && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#8A7F6E"
    }
  }, status === "accepted" ? "will be added to next visit" : "won't be added")));
}
function VisitReview({
  client
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [grassPresent, setGrassPresent] = useState([]);
  const [weedsObserved, setWeedsObserved] = useState([]);
  const [turfConditions, setTurfConditions] = useState([]);
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [tertiary, setTertiary] = useState("");
  const [primaryStatus, setPrimaryStatus] = useState(null);
  const [secondaryStatus, setSecondaryStatus] = useState(null);
  const [tertiaryStatus, setTertiaryStatus] = useState(null);
  const [log, setLog] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [planPrefilled, setPlanPrefilled] = useState(false);
  const [planIds, setPlanIds] = useState([]);
  const [declinedIds, setDeclinedIds] = useState([]);
  const [recsTouched, setRecsTouched] = useState(false);
  const logKey = `visit-review:${client.id}`;
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(logKey, true);
        if (!cancelled) setLog(result && result.value ? JSON.parse(result.value) : []);
      } catch (e) {
        if (!cancelled) setLog([]);
      }
      const ids = await getPlanRecommendationIds(client);
      if (!cancelled) setPlanIds(ids);
      // Services this client has already passed on get down-ranked rather than hidden.
      try {
        const dResult = await window.storage.get(`lawn-plan-declines:${client.id}`, true);
        const declines = dResult && dResult.value ? JSON.parse(dResult.value) : [];
        const declinedServiceIds = [];
        declines.forEach(d => (d.tasks || []).forEach(t => {
          const svc = matchTaskToService(t);
          if (svc) {
            const addonId = OTHER_TO_ADDON_ID[svc.id] || svc.id;
            if (!declinedServiceIds.includes(addonId)) declinedServiceIds.push(addonId);
          }
        }));
        if (!cancelled) setDeclinedIds(declinedServiceIds);
      } catch (e) {
        // no decline history — fine
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, client.id]);
  // Re-rank whenever observations change, so checking "crabgrass" or "spongy underfoot"
  // immediately reshuffles the three slots. Stops once the owner edits a slot manually.
  useEffect(() => {
    if (!open || recsTouched) return;
    const ranked = rankRecommendations({
      weeds: weedsObserved,
      conditions: turfConditions,
      planIds,
      declinedIds
    });
    if (ranked.length === 0) return;
    setPlanPrefilled(true);
    setPrimary(ranked[0] || "");
    setSecondary(ranked[1] || "");
    setTertiary(ranked[2] || "");
  }, [open, weedsObserved, turfConditions, planIds, declinedIds, recsTouched]);
  const toggleCondition = c => {
    setTurfConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };
  const toggleGrass = g => {
    setGrassPresent(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };
  const toggleWeed = w => {
    setWeedsObserved(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };
  const handleSave = async () => {
    setError(null);
    const priceOf = id => {
      // Prefer the client's sqft-based price; fall back to the generic catalog price
      // for services without a sqft rate, or when no square footage is on file.
      const otherId = Object.keys(OTHER_TO_ADDON_ID).find(k => OTHER_TO_ADDON_ID[k] === id);
      const other = OTHER_SERVICES.find(o => o.id === (otherId || id));
      if (other) {
        const sqftPrice = otherServicePrice(other, client);
        if (sqftPrice != null) return `$${sqftPrice.toFixed(2)}`;
      }
      const s = buildServices("Weekly", null).find(x => x.id === id);
      return s ? s.flat ? `$${s.price}` : `$${s.price}/${s.unit}` : "";
    };
    const entry = {
      date: localDateISO(),
      notes,
      grassPresent,
      weedsObserved,
      turfConditions,
      primary: primary ? `${ADD_ONS.find(s => s.id === primary)?.name} (${priceOf(primary)})` : "",
      secondary: secondary ? `${ADD_ONS.find(s => s.id === secondary)?.name} (${priceOf(secondary)})` : "",
      tertiary: tertiary ? `${ADD_ONS.find(s => s.id === tertiary)?.name} (${priceOf(tertiary)})` : "",
      primaryStatus,
      secondaryStatus,
      tertiaryStatus
    };
    try {
      const newLog = [entry, ...(log || [])].slice(0, 20);
      const result = await window.storage.set(logKey, JSON.stringify(newLog), true);
      if (!result) throw new Error("Storage failed");
      setLog(newLog);
      setSaved(true);
      setNotes("");
      setGrassPresent([]);
      setWeedsObserved([]);
      setTurfConditions([]);
      setRecsTouched(false);
      setPrimary("");
      setSecondary("");
      setTertiary("");
      setPrimaryStatus(null);
      setSecondaryStatus(null);
      setTertiaryStatus(null);
      setPlanPrefilled(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError("Couldn't save the visit review — try again.");
    }
  };

  // Keep a running "accepted for next visit" list per client, so it's easy to reference when prepping the next stop
  const syncNextVisitQueue = async (id, name, priceLabel, accepted) => {
    const queueKey = `next-visit-queue:${client.id}`;
    try {
      const result = await window.storage.get(queueKey, true);
      const queue = result && result.value ? JSON.parse(result.value) : [];
      const filtered = queue.filter(item => item.id !== id);
      const updated = accepted ? [...filtered, {
        id,
        name,
        price: priceLabel
      }] : filtered;
      await window.storage.set(queueKey, JSON.stringify(updated), true);
    } catch (e) {
      // best-effort — visit review still saves even if the queue sync fails
    }
  };
  const handleStatusChange = (slot, id, status) => {
    const setStatus = {
      primary: setPrimaryStatus,
      secondary: setSecondaryStatus,
      tertiary: setTertiaryStatus
    }[slot];
    setStatus(status);
    if (id) {
      const s = buildServices("Weekly", null).find(x => x.id === id);
      const name = ADD_ONS.find(a => a.id === id)?.name || "";
      const priceLabel = s ? s.flat ? `$${s.price}` : `$${s.price}/${s.unit}` : "";
      syncNextVisitQueue(id, name, priceLabel, status === "accepted");
    }
  };
  const excludedForSecondary = primary ? [primary] : [];
  const excludedForTertiary = [primary, secondary].filter(Boolean);
  const lastEntry = log && log.length > 0 ? log[0] : null;
  const [sendStatus, setSendStatus] = useState(null); // null | "sent" | "error"

  const buildCustomerMessage = () => {
    // If the form was just cleared by Save, fall back to the entry that was just saved
    const useForm = notes || grassPresent.length > 0 || weedsObserved.length > 0 || primary || secondary || tertiary;
    const priceOf = id => {
      // Prefer the client's sqft-based price; fall back to the generic catalog price
      // for services without a sqft rate, or when no square footage is on file.
      const otherId = Object.keys(OTHER_TO_ADDON_ID).find(k => OTHER_TO_ADDON_ID[k] === id);
      const other = OTHER_SERVICES.find(o => o.id === (otherId || id));
      if (other) {
        const sqftPrice = otherServicePrice(other, client);
        if (sqftPrice != null) return `$${sqftPrice.toFixed(2)}`;
      }
      const s = buildServices("Weekly", null).find(x => x.id === id);
      return s ? s.flat ? `$${s.price}` : `$${s.price}/${s.unit}` : "";
    };
    const source = useForm ? {
      notes,
      grassPresent,
      weedsObserved,
      turfConditions,
      primary: primary ? `${ADD_ONS.find(s => s.id === primary)?.name} (${priceOf(primary)})` : "",
      secondary: secondary ? `${ADD_ONS.find(s => s.id === secondary)?.name} (${priceOf(secondary)})` : "",
      tertiary: tertiary ? `${ADD_ONS.find(s => s.id === tertiary)?.name} (${priceOf(tertiary)})` : ""
    } : lastEntry || {
      notes: "",
      grassPresent: [],
      weedsObserved: [],
      primary: "",
      secondary: "",
      tertiary: ""
    };
    const recNames = [source.primary, source.secondary, source.tertiary].filter(Boolean);
    const lines = [];
    lines.push(`Hi ${client.name.split(" ")[0]}, this is Mow Masters of Edmond. Here's a recap of today's visit at ${client.address}:`);
    if (source.notes) lines.push(`\n${source.notes}`);
    if (source.grassPresent.length > 0) lines.push(`\nGrass: ${source.grassPresent.join(", ")}`);
    if (source.weedsObserved.length > 0) lines.push(`Weeds noted: ${source.weedsObserved.join(", ")}`);
    if (recNames.length > 0) lines.push(`\nRecommended for your property: ${recNames.join(", ")}\nReply and let us know which you'd like added to your next visit.`);
    const upcoming = getUpcomingRecommendations();
    const monthsWithItems = upcoming.filter(m => m.items.length > 0);
    if (monthsWithItems.length > 0) {
      lines.push(`\nComing up over the next few months:`);
      monthsWithItems.forEach(m => {
        const names = m.items.map(r => ADD_ONS.find(s => s.id === r.id)?.name).filter(Boolean);
        lines.push(`${m.monthName}: ${names.join(", ")}`);
      });
    }
    lines.push(`\nQuestions or want to schedule any of this? Just reply here!`);
    return lines.join("\n");
  };
  const handleSendReview = async () => {
    const message = buildCustomerMessage();
    // Copy rather than launching a text — the message often goes out via Facebook
    // Messenger, and an sms: link does nothing on desktop anyway.
    try {
      await navigator.clipboard.writeText(message);
      setSendStatus("sent");
    } catch (e) {
      setSendStatus("error");
    }
    setTimeout(() => setSendStatus(null), 2500);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      width: 52
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(o => !o),
    title: open ? "Close review" : lastEntry ? `Review visit (last logged ${lastEntry.date})` : "Review visit",
    "aria-label": open ? "Close review" : "Review visit",
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      background: open ? "#3E5C2C" : "#8A6A1C",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, open ? "Close" : "Review")), open && /*#__PURE__*/React.createElement("div", {
    style: {
      flexBasis: "100%",
      padding: "12px",
      background: "#FBF3DE",
      border: "1px solid #E9D9A8",
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "What was done"), /*#__PURE__*/React.createElement("textarea", {
    value: notes,
    onChange: e => setNotes(e.target.value),
    rows: 2,
    placeholder: "Mow, trim, edge as normal — note anything unusual",
    style: {
      width: "100%",
      padding: "8px 10px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 13,
      fontFamily: "inherit",
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "Grass present"), /*#__PURE__*/React.createElement(CheckboxColumn, {
    options: GRASS_TYPES,
    selected: grassPresent,
    onToggle: toggleGrass
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "Weeds observed"), /*#__PURE__*/React.createElement(CheckboxColumn, {
    options: WEED_TYPES,
    selected: weedsObserved,
    onToggle: toggleWeed
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "Turf condition"), /*#__PURE__*/React.createElement(CheckboxColumn, {
    options: TURF_CONDITIONS,
    selected: turfConditions,
    onToggle: toggleCondition
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#2A2620",
      marginBottom: 6
    }
  }, "Recommended for next visit"), planPrefilled && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#5C7A3E",
      marginTop: -4,
      marginBottom: 6
    }
  }, "Ranked from what you observed + their lawn plan and the season \u2014 change any as needed."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(RecommendationSelect, {
    label: "Primary",
    value: primary,
    onChange: id => {
      setRecsTouched(true);
      setPrimary(id);
      setPrimaryStatus(null);
    },
    excluded: [secondary, tertiary].filter(Boolean),
    status: primaryStatus,
    onStatusChange: status => handleStatusChange("primary", primary, status),
    client: client
  }), /*#__PURE__*/React.createElement(RecommendationSelect, {
    label: "Secondary",
    value: secondary,
    onChange: id => {
      setRecsTouched(true);
      setSecondary(id);
      setSecondaryStatus(null);
    },
    excluded: excludedForSecondary,
    status: secondaryStatus,
    onStatusChange: status => handleStatusChange("secondary", secondary, status),
    client: client
  }), /*#__PURE__*/React.createElement(RecommendationSelect, {
    label: "Tertiary",
    value: tertiary,
    onChange: id => {
      setRecsTouched(true);
      setTertiary(id);
      setTertiaryStatus(null);
    },
    excluded: excludedForTertiary,
    status: tertiaryStatus,
    onStatusChange: status => handleStatusChange("tertiary", tertiary, status),
    client: client
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleSave,
    style: {
      padding: "10px",
      borderRadius: 8,
      border: "none",
      background: saved ? "#5C7A3E" : "#B5602F",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer"
    }
  }, saved ? "Saved ✓" : "Save visit review"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleSendReview,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "10px",
      borderRadius: 8,
      border: "none",
      background: sendStatus === "sent" ? "#5C7A3E" : "#2D6E5C",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer"
    }
  }, sendStatus === "sent" ? "Sent ✓" : sendStatus === "error" ? "Couldn't send — try again" : client.phone ? "Text review to customer" : "Copy review to send"), !client.phone && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#8A7F6E"
    }
  }, "No phone on file for ", client.name.split(" ")[0], " — copied to clipboard instead."), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438"
    }
  }, error), log && log.length > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowHistory(s => !s),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#5C7A3E",
      fontSize: 11,
      textAlign: "left",
      padding: 0
    }
  }, showHistory ? "Hide" : "Show", " past reviews (", log.length, ")"), showHistory && log && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, log.map((entry, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 11,
      color: "#5C4E2E",
      padding: "8px 10px",
      background: "#fff",
      borderRadius: 8,
      border: "1px solid #E9D9A8"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 3
    }
  }, entry.date), entry.notes && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 3
    }
  }, entry.notes), entry.grassPresent.length > 0 && /*#__PURE__*/React.createElement("div", null, "Grass: ", entry.grassPresent.join(", ")), entry.weedsObserved.length > 0 && /*#__PURE__*/React.createElement("div", null, "Weeds: ", entry.weedsObserved.join(", ")), entry.primary && /*#__PURE__*/React.createElement("div", null, "Primary: ", entry.primary, " ", entry.primaryStatus === "accepted" ? "✓ accepted" : entry.primaryStatus === "declined" ? "✗ declined" : "(no response logged)"), entry.secondary && /*#__PURE__*/React.createElement("div", null, "Secondary: ", entry.secondary, " ", entry.secondaryStatus === "accepted" ? "✓ accepted" : entry.secondaryStatus === "declined" ? "✗ declined" : "(no response logged)"), entry.tertiary && /*#__PURE__*/React.createElement("div", null, "Tertiary: ", entry.tertiary, " ", entry.tertiaryStatus === "accepted" ? "✓ accepted" : entry.tertiaryStatus === "declined" ? "✗ declined" : "(no response logged)"))))));
}
function WeedTypeSelect({
  selected,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      padding: "10px 12px",
      background: "#F0EBD8",
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginBottom: 6
    }
  }, "Which weeds do you see? (select any that apply)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, WEED_TYPES.map(w => {
    const isChecked = selected.includes(w);
    return /*#__PURE__*/React.createElement("label", {
      key: w,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: "#2A2620",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: isChecked,
      onChange: () => onToggle(w),
      style: {
        width: 15,
        height: 15,
        accentColor: "#5C7A3E",
        flexShrink: 0
      }
    }), w);
  })));
}
const OWNER_PHONE = "3163029980"; // texts land here when a customer requests a property over 10,000 sqft

function BookRequest() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    notes: "",
    frequency: "Bi-weekly",
    requestedDay: ""
  });
  const [mowTier, setMowTier] = useState("");
  const [lotSqft, setLotSqft] = useState(null);
  const [addOns, setAddOns] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [weedTypes, setWeedTypes] = useState([]);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);
  useEffect(() => {
    if (mowTier !== "mow-large" && WEEKEND_DAYS.includes(form.requestedDay)) {
      setForm(prev => ({
        ...prev,
        requestedDay: ""
      }));
    }
  }, [mowTier]);
  const selectedServices = mowTier ? [mowTier, ...addOns] : addOns;
  const toggleAddOn = id => {
    setAddOns(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const toggleWeedType = w => {
    setWeedTypes(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };
  const setQuantity = (id, qty) => {
    setQuantities(prev => ({
      ...prev,
      [id]: qty
    }));
  };
  const handleSubmit = async () => {
    if (!form.name || !form.address) return;
    setSubmitError(null);
    const {
      total
    } = computeQuote(selectedServices, form.frequency, quantities, mowTier, lotSqft);
    const chosenNames = buildServices(form.frequency, mowTier, lotSqft).filter(s => selectedServices.includes(s.id)).map(s => s.name);
    const record = {
      id: `${Date.now()}`,
      name: form.name,
      address: form.address,
      phone: form.phone,
      notes: form.notes,
      frequency: form.frequency,
      requestedDay: form.requestedDay,
      services: chosenNames,
      weedTypes,
      total,
      status: "pending",
      submittedAt: new Date().toISOString()
    };

    // Best-effort local log — not the real notification, see the text below
    try {
      await window.storage.set(`service-request:${record.id}`, JSON.stringify(record), true);
    } catch (e) {
      // storage save failing shouldn't block the actual notification below
    }

    // This is what actually reaches you: a real text, sent from the customer's own
    // phone to yours, the moment they submit — not something you have to check for.
    const ownerLines = [];
    ownerLines.push(`New quote request: ${form.name} — ${form.address}`);
    ownerLines.push(`${form.frequency}${form.requestedDay ? `, preferred day: ${form.requestedDay}` : ""}`);
    if (chosenNames.length > 0) ownerLines.push(`Services: ${chosenNames.join(", ")}`);
    if (weedTypes.length > 0) ownerLines.push(`Weeds noted: ${weedTypes.join(", ")}`);
    ownerLines.push(`Quoted total: $${total.toFixed(2)}`);
    if (form.notes) ownerLines.push(`Notes: ${form.notes}`);
    if (form.phone) ownerLines.push(`Their number: ${form.phone}`);
    // Copy first — on desktop an sms: link just opens a dead blank tab, so the
    // clipboard is the only reliable delivery. On a phone the text app still opens.
    const ownerMsg = ownerLines.join("\n");
    try {
      await navigator.clipboard.writeText(ownerMsg);
    } catch (e) {
      // clipboard unavailable — the request is still saved and shows in Requests
    }
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.open(`sms:${OWNER_PHONE}?&body=${encodeURIComponent(ownerMsg)}`, "_blank");
    }
    setSubmitted(true);
  };
  const buildQuoteMessage = () => {
    const {
      items,
      total
    } = computeQuote(selectedServices, form.frequency, quantities, mowTier, lotSqft);
    const lines = items.map(s => s.flat ? `- ${s.name}: $${s.price}` : `- ${s.name}: ${quantities[s.id] || 1} ${s.unit} × $${s.price} = $${(s.price * (quantities[s.id] || 1)).toFixed(2)}`);
    const totalLine = items.length === 0 ? "" : `\nEstimated total: $${total.toFixed(2)}`;
    const weedLine = addOns.includes("weed-post") && weedTypes.length > 0 ? `\nWeeds noted: ${weedTypes.join(", ")}` : "";
    return `Hi ${form.name.split(" ")[0] || "there"}, this is Mow Masters of Edmond. Here's your quote for ${form.address || "your property"} ` + `(${form.frequency}):\n${lines.join("\n")}${totalLine}${weedLine}\n\nFinal amount confirmed on-site. Reply here or call/text to book!`;
  };
  const handleSendQuote = async () => {
    setQuoteError(null);
    const message = buildQuoteMessage();

    // Guaranteed action: notify you. Mobile browsers generally only allow one
    // "open Messages" action per tap, so this is the one that always fires.
    const {
      total
    } = computeQuote(selectedServices, form.frequency, quantities, mowTier, lotSqft);
    const ownerLines = [];
    ownerLines.push(`Quote completed: ${form.name || "(no name given)"} — ${form.address || "(no address given)"}`);
    ownerLines.push(`${form.frequency}${form.requestedDay ? `, preferred day: ${form.requestedDay}` : ""}`);
    ownerLines.push(`Total shown: $${total.toFixed(2)}`);
    if (form.phone) ownerLines.push(`Their number: ${form.phone}`);
    // On desktop an sms: link opens a dead blank tab, so only fire it on mobile.
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.open(`sms:${OWNER_PHONE}?&body=${encodeURIComponent(ownerLines.join("\n"))}`, "_blank");
    }

    // Secondary: customer-facing copy goes to clipboard rather than a second text,
    // since a second window.open here is unreliable on most mobile browsers.
    try {
      await navigator.clipboard.writeText(message);
      setQuoteSent(true);
      setTimeout(() => setQuoteSent(false), 2500);
    } catch (e) {
      setQuoteError("Couldn't copy the quote — try again, or take a screenshot of the totals above.");
    }
  };
  const [customQuoteSent, setCustomQuoteSent] = useState(false);
  const buildCustomQuoteMessage = () => {
    const chosenNames = buildServices(form.frequency, mowTier, lotSqft).filter(s => selectedServices.includes(s.id) && s.id !== "mow-large").map(s => s.name);
    const lines = [];
    lines.push(`Hi, this is ${form.name || "a prospective customer"} — requesting a quote for a Large property${lotSqft ? ` (~${lotSqft.toLocaleString()} sqft)` : ""} at ${form.address || "(address not given)"}.`);
    lines.push(`Frequency: ${form.frequency}${form.requestedDay ? `, preferred day: ${form.requestedDay}` : ""}.`);
    if (chosenNames.length > 0) lines.push(`Interested in: ${chosenNames.join(", ")}.`);
    if (weedTypes.length > 0) lines.push(`Weeds noted: ${weedTypes.join(", ")}.`);
    if (form.notes) lines.push(`Notes: ${form.notes}`);
    if (form.phone) lines.push(`My number: ${form.phone}`);
    lines.push(`Please send me a price!`);
    return lines.join("\n");
  };
  const handleCustomQuoteRequest = async () => {
    const message = buildCustomQuoteMessage();
    try {
      await navigator.clipboard.writeText(message);
    } catch (e) {
      // clipboard unavailable — mobile still gets the text below
    }
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.open(`sms:${OWNER_PHONE}?&body=${encodeURIComponent(message)}`, "_blank");
    }
    setCustomQuoteSent(true);
  };
  if (submitted) {
    const {
      items: chosen
    } = computeQuote(selectedServices, form.frequency, quantities, mowTier, lotSqft);
    return /*#__PURE__*/React.createElement(Card, {
      style: {
        textAlign: "center",
        padding: 32
      }
    }, /*#__PURE__*/React.createElement(CheckCircle2, {
      size: 36,
      color: "#5C7A3E",
      style: {
        margin: "0 auto 10px"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Roboto Slab', serif",
        fontSize: 17,
        fontWeight: 700,
        color: "#2A2620"
      }
    }, "Request sent — pending approval"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "#5C5346",
        marginTop: 6
      }
    }, "Mow Masters of Edmond will confirm your day and reach out to book your first visit."), form.requestedDay && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        fontSize: 12,
        color: "#B58A2C"
      }
    }, "Requested day: ", /*#__PURE__*/React.createElement("strong", null, form.requestedDay), " (subject to approval)"), chosen.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        textAlign: "left",
        fontSize: 12,
        color: "#5C5346"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        marginBottom: 4,
        color: "#2A2620"
      }
    }, "Requested services (", form.frequency, "):"), chosen.map(s => /*#__PURE__*/React.createElement("div", {
      key: s.id
    }, "• ", s.name)), addOns.includes("weed-post") && weedTypes.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "#2A2620"
      }
    }, "Weeds noted: "), weedTypes.join(", "))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#5C5346",
      marginBottom: 4
    }
  }, "Serving Edmond, Choctaw, Moore, Midwest City & Spencer."), ["name", "address", "phone"].map(field => /*#__PURE__*/React.createElement("input", {
    key: field,
    placeholder: field === "name" ? "Full name" : field === "address" ? "Property address" : "Phone number",
    value: form[field],
    onChange: e => setForm({
      ...form,
      [field]: e.target.value
    }),
    style: {
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 14,
      fontFamily: "inherit"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, "Service frequency"), /*#__PURE__*/React.createElement("select", {
    value: form.frequency,
    onChange: e => setForm({
      ...form,
      frequency: e.target.value
    }),
    style: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 14,
      fontFamily: "inherit",
      background: "#fff",
      color: "#2A2620"
    }
  }, FREQUENCIES.map(f => /*#__PURE__*/React.createElement("option", {
    key: f,
    value: f
  }, f))), form.frequency !== "Weekly" && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#B58A2C",
      marginTop: 4
    }
  }, "Mow pricing runs ~10% lower on Weekly service — switch above to see the savings.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, "Lawn size"), /*#__PURE__*/React.createElement(MowTierSelect, {
    value: mowTier,
    onChange: setMowTier,
    frequency: form.frequency
  })), mowTier === "mow-large" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, "Exact lot size (optional)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: lotSqft === null ? "" : lotSqft,
    onChange: e => setLotSqft(e.target.value === "" ? null : Number(e.target.value)),
    placeholder: "e.g. 17500",
    style: {
      flex: 1,
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 14,
      fontFamily: "inherit"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#8A7F6E"
    }
  }, "sqft")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginTop: 4
    }
  }, lotSqft && lotSqft > LARGE_THRESHOLD_SQFT ? `Aeration, overseeding, fertilization, and weed control scale up beyond ${LARGE_THRESHOLD_SQFT.toLocaleString()} sqft — priced automatically below.` : `Leave blank to use the standard Large flat rate (based on ${LARGE_THRESHOLD_SQFT.toLocaleString()} sqft). Over that, pricing scales up per 100 sqft.`)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, "Requested service day"), /*#__PURE__*/React.createElement("select", {
    value: form.requestedDay,
    onChange: e => setForm({
      ...form,
      requestedDay: e.target.value
    }),
    style: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 14,
      fontFamily: "inherit",
      background: "#fff",
      color: "#2A2620"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "No preference"), ROUTE_DAYS.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d)), mowTier === "mow-large" && WEEKEND_DAYS.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d, " (Large properties only)"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginTop: 4
    }
  }, mowTier === "mow-large" ? "Weekend service available for Large properties — subject to approval." : "Weekend service is available for Large properties only. Select a lawn size above to see if you qualify.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5C5346",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      fontFamily: "'JetBrains Mono', monospace"
    }
  }, "Add-on services"), !mowTier && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#B58A2C",
      marginBottom: 6
    }
  }, "Aeration, Overseeding, Fertilization, Weed Control, and Bed Cleanup prices shown are Medium-lawn estimates — select a lawn size above for your actual price."), /*#__PURE__*/React.createElement(WeatherBanner, {
    temp: currentTemp,
    onChange: setCurrentTemp
  }), /*#__PURE__*/React.createElement(AddOnButtons, {
    selected: addOns,
    onToggle: toggleAddOn,
    quantities: quantities,
    onQuantityChange: setQuantity,
    weedTypes: weedTypes,
    onToggleWeedType: toggleWeedType,
    frequency: form.frequency,
    mowTier: mowTier,
    currentTemp: currentTemp,
    lotSqft: lotSqft
  })), /*#__PURE__*/React.createElement(QuoteSummary, {
    selected: selectedServices,
    frequency: form.frequency,
    quantities: quantities,
    mowTier: mowTier,
    lotSqft: lotSqft
  }), /*#__PURE__*/React.createElement("textarea", {
    placeholder: "Anything we should know? (lawn size, current issues, preferred day)",
    value: form.notes,
    onChange: e => setForm({
      ...form,
      notes: e.target.value
    }),
    rows: 3,
    style: {
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #DDD3BC",
      fontSize: 14,
      fontFamily: "inherit",
      resize: "vertical"
    }
  }), mowTier === "mow-large" ? /*#__PURE__*/React.createElement("button", {
    onClick: handleCustomQuoteRequest,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "12px",
      borderRadius: 8,
      border: "none",
      background: customQuoteSent ? "#5C7A3E" : "#B5602F",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(DollarSign, {
    size: 14
  }), customQuoteSent ? "Sent ✓ — we'll text you back" : "Text Mow Masters for a custom quote") : /*#__PURE__*/React.createElement(React.Fragment, null, selectedServices.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: handleSendQuote,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "11px",
      borderRadius: 8,
      border: "none",
      background: quoteSent ? "#5C7A3E" : "#2D6E5C",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(DollarSign, {
    size: 14
  }), quoteSent ? "Quote copied ✓" : "Complete quote (copies quote)"), quoteError && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438"
    }
  }, quoteError), /*#__PURE__*/React.createElement("button", {
    onClick: handleSubmit,
    style: {
      padding: "12px",
      borderRadius: 8,
      border: "none",
      background: "#B5602F",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      marginTop: 4
    }
  }, "Request service"), submitError && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438"
    }
  }, submitError)));
}

// ---------- SYNC TO BIBLE ----------

// Shared helper so both the Dashboard banner and the Requests tab badge can
// show an accurate pending count without duplicating the request-loading logic.
async function countPendingRequests() {
  let keys = [];
  try {
    const listResult = await window.storage.list("service-request:", true);
    keys = (listResult && listResult.keys) || [];
  } catch (e) {
    return 0;
  }
  let count = 0;
  for (const key of keys) {
    try {
      const r = await window.storage.get(key, true);
      if (r && r.value) {
        const parsed = JSON.parse(r.value);
        if (parsed.status === "pending") count++;
      }
    } catch (e) {
      // skip unreadable entry
    }
  }
  return count;
}
// ---------- FULL DATA BACKUP (raw JSON export/import, distinct from the Bible summary) ----------

async function exportAllData(clients) {
  const data = {};
  // Business data lives in shared storage (syncs across devices); a handful of settings
  // and UI state stay device-local. A backup needs both, tagged so a future restore can
  // put each key back in the right place.
  for (const shared of [true, false]) {
    let keys = [];
    try {
      const listResult = await window.storage.list(undefined, shared);
      keys = listResult && listResult.keys ? listResult.keys : [];
    } catch (e) {
      continue; // one scope failing shouldn't abort the whole backup
    }
    for (const key of keys) {
      try {
        const result = await window.storage.get(key, shared);
        if (result && result.value !== undefined) {
          data[`${shared ? "shared" : "device"}:${key}`] = result.value;
        }
      } catch (e) {
        // skip unreadable key — rest of backup still proceeds
      }
    }
  }
  const backup = {
    app: "Mow Masters of Edmond",
    exportedAt: new Date().toISOString(),
    clientCount: clients ? clients.length : null,
    data
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = localDateISO();
  a.href = url;
  a.download = `mow-masters-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  await window.storage.set("last-backup-date", stamp, false);
  return stamp;
}
function DataBackup() {
  const {
    clients
  } = useClients();
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [lastBackup, setLastBackup] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get("last-backup-date", false);
        if (!cancelled) setLastBackup(result && result.value ? result.value : null);
      } catch (e) {
        // no backup recorded yet — that's fine
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const stamp = await exportAllData(clients);
      setLastBackup(stamp);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (e) {
      setError("Couldn't build the backup — try again.");
    }
    setExporting(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      paddingTop: 16,
      borderTop: "1px solid #DDD3BC"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#5C5346",
      marginBottom: 12,
      lineHeight: 1.5
    }
  }, "Downloads a raw JSON snapshot of everything stored in Supabase — clients, timer logs, payment logs, reminder logs, visit reviews. Keep it somewhere safe (Drive, email to yourself) in case the database ever goes down."), /*#__PURE__*/React.createElement("button", {
    onClick: handleExport,
    disabled: exporting,
    style: {
      width: "100%",
      padding: "12px",
      borderRadius: 8,
      border: "none",
      background: done ? "#5C7A3E" : "#3E5C2C",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 14,
      cursor: exporting ? "default" : "pointer",
      opacity: exporting ? 0.6 : 1
    }
  }, exporting ? "Building backup…" : done ? "Downloaded ✓" : "Download full backup (JSON)"), lastBackup && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      fontFamily: "'JetBrains Mono', monospace",
      marginTop: 6,
      textAlign: "center"
    }
  }, "last backup ", lastBackup), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438",
      marginTop: 6
    }
  }, error));
}

function FuelSettings() {
  const [apiKey, setApiKey] = useState("");
  const [mpg, setMpg] = useState("17");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await getFuelSettings();
      if (!cancelled) {
        setApiKey(settings.apiKey);
        setMpg(String(settings.mpg));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleSave = async () => {
    setError(null);
    const mpgNum = Number(mpg);
    if (!mpgNum || mpgNum <= 0) {
      setError("Enter a valid MPG number.");
      return;
    }
    try {
      await window.storage.set("gmaps-api-key", apiKey.trim(), true);
      await window.storage.set("vehicle-mpg", String(mpgNum), true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError("Couldn't save — try again.");
    }
  };
  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #DDD3BC",
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    background: "#fff",
    color: "#2A2620"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      paddingTop: 16,
      borderTop: "1px solid #DDD3BC"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 6,
      color: "#2A2620"
    }
  }, "Fuel and mileage"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#5C5346",
      marginBottom: 12,
      lineHeight: 1.5
    }
  }, "Powers the round-trip mileage and fuel cost shown under each day's route in the schedule. Your key stays in Supabase, not in the app's source code."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "Google Maps API key"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: apiKey,
    onChange: e => setApiKey(e.target.value),
    placeholder: "AIza…",
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8A7F6E",
      marginBottom: 3
    }
  }, "Vehicle MPG (combined)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    min: "1",
    value: mpg,
    onChange: e => setMpg(e.target.value),
    placeholder: "17",
    style: inputStyle
  })), /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    style: {
      padding: "10px",
      borderRadius: 8,
      border: "none",
      background: saved ? "#5C7A3E" : "#3E5C2C",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer"
    }
  }, saved ? "Saved ✓" : "Save fuel settings"), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438"
    }
  }, error)));
}

// ---------- PUSH NOTIFICATIONS (subscribe UI — actual sending happens server-side via a
// Supabase Edge Function, see push-notify/index.ts, since sending requires the private
// VAPID key which must never be exposed in this client-side file) ----------

const VAPID_PUBLIC_KEY = "BGyVFcb657dq50piQ-ci8bw6dOeuIq6_EkYJtRMEqmXYZy_csA75c8st2fLGjM1MqNA7i1Hvr6uFXqrQGmyhAf8";
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function PushNotificationSettings() {
  const [status, setStatus] = useState("checking"); // checking | unsupported | denied | off | on | working
  const [error, setError] = useState(null);
  const checkStatus = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      setStatus(existing ? "on" : "off");
    } catch (e) {
      setStatus("unsupported");
    }
  };
  useEffect(() => {
    checkStatus();
  }, []);
  const handleEnable = async () => {
    setError(null);
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      const subJson = subscription.toJSON();
      // Keyed by endpoint (unique per device+browser) so re-subscribing overwrites cleanly
      // instead of piling up duplicate rows the Edge Function would send to needlessly.
      const deviceKey = `push-subscription:${btoa(subJson.endpoint).slice(-40)}`;
      const result = await window.storage.set(deviceKey, JSON.stringify(subJson), true);
      if (!result) throw new Error("Storage failed");
      setStatus("on");
    } catch (e) {
      setError("Couldn't enable notifications — try again.");
      setStatus("off");
    }
  };
  const handleDisable = async () => {
    setError(null);
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        const endpoint = existing.endpoint;
        await existing.unsubscribe();
        const deviceKey = `push-subscription:${btoa(endpoint).slice(-40)}`;
        await window.storage.delete(deviceKey, true).catch(() => {
          // best-effort — even if the stored record lingers, unsubscribe() already
          // stopped the browser from receiving pushes for this device
        });
      }
      setStatus("off");
    } catch (e) {
      setError("Couldn't disable — try again.");
      setStatus("on");
    }
  };
  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #DDD3BC",
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    background: "#fff",
    color: "#2A2620"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      paddingTop: 16,
      borderTop: "1px solid #DDD3BC"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 6,
      color: "#2A2620"
    }
  }, "Push notifications"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#5C5346",
      marginBottom: 12,
      lineHeight: 1.5
    }
  }, "Get a real phone notification the moment a new quote request comes in — even if the app isn't open. On iPhone, this only works if you've added the app to your Home Screen first (Share → Add to Home Screen)."), status === "unsupported" && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8A7F6E"
    }
  }, "Not supported in this browser. On iPhone, make sure you've added this app to your Home Screen and are opening it from there, not Safari directly."), status === "denied" && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#A65438"
    }
  }, "Notifications are blocked for this app in your phone/browser settings. You'll need to re-enable them there before this can work."), (status === "off" || status === "on" || status === "working") && /*#__PURE__*/React.createElement("button", {
    onClick: status === "on" ? handleDisable : handleEnable,
    disabled: status === "working",
    style: {
      padding: "10px",
      borderRadius: 8,
      border: "none",
      width: "100%",
      background: status === "on" ? "#5C7A3E" : "#3E5C2C",
      color: "#fff",
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 13,
      cursor: status === "working" ? "default" : "pointer",
      opacity: status === "working" ? 0.6 : 1
    }
  }, status === "working" ? "Working…" : status === "on" ? "Notifications On ✓ (tap to turn off)" : "Enable push notifications"), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#A65438",
      marginTop: 6
    }
  }, error));
}

// ---------- AUTH COMPONENTS (from auth-components.jsx, loaded via index.html) ----------

// These are exported from auth-components.jsx and made available globally.
// If not available, provide fallback stubs.
const LoginPage = window.LoginPage || (() => /*#__PURE__*/React.createElement("div", { style: { padding: 20 } }, "LoginPage not loaded"));
const BiometricSetupPage = window.BiometricSetupPage || (() => /*#__PURE__*/React.createElement("div", { style: { padding: 20 } }, "BiometricSetupPage not loaded"));
const RememberDevicePrompt = window.RememberDevicePrompt || (() => /*#__PURE__*/React.createElement("div", { style: { padding: 20 } }, "RememberDevicePrompt not loaded"));

function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Sign out from Supabase
      await window.authModule.supabase.signOut();
      // Clear device memory
      window.authModule.clearDeviceMemory();
      // Redirect to login by reloading the app
      window.location.href = window.location.pathname;
    } catch (e) {
      console.error("Logout failed:", e);
      alert("Logout failed: " + e.message);
      setLoading(false);
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 18px",
      borderTop: "1px solid #E5DCC8",
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleLogout,
    disabled: loading,
    style: {
      width: "100%",
      padding: "12px 16px",
      background: "#D9534F",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "'Inter', system-ui, sans-serif",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.6 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "opacity 0.2s"
    }
  }, /*#__PURE__*/React.createElement(LogOut, {
    size: 16
  }), loading ? "Logging out..." : "Logout"));
}

function SyncToBible() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DataBackup, null), /*#__PURE__*/React.createElement(FuelSettings, null), /*#__PURE__*/React.createElement(PushNotificationSettings, null), /*#__PURE__*/React.createElement(LogoutButton, null));
}

// ---------- APP SHELL ----------

const TABS = [{
  key: "dashboard",
  label: "Dashboard",
  icon: Sun
}, {
  key: "clients",
  label: "Clients",
  icon: Users
}, {
  key: "sync",
  label: "Settings",
  icon: History
}];
const VALID_TABS = TABS.map(t => t.key);
function getTabFromHash() {
  const hash = window.location.hash.replace("#", "");
  return VALID_TABS.includes(hash) ? hash : "dashboard";
}

// Standalone customer-facing quote page — no nav bar, no access to Schedule/Clients/
// Requests/Sync or any other internal business data. This is the ONLY thing that
// should ever be linked to customers.
function PublicQuotePage() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#F2EDDD",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#2A2620",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("link", {
    href: "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
    rel: "stylesheet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 460,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 18px 10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Scissors, {
    size: 20,
    color: "#3E5C2C"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 18,
      color: "#2D4222"
    }
  }, "Mow Masters of Edmond")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8A7F6E",
      marginTop: 2,
      marginLeft: 28
    }
  }, "Edmond · Choctaw · Moore · Midwest City · Spencer")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: "8px 18px 40px"
    }
  }, /*#__PURE__*/React.createElement(BookRequest, null))));
}
export default function App() {
  // ---------- PHASE 2: AUTH STATE MANAGEMENT ----------
  const [authState, setAuthState] = useState({
    user: null,
    stage: "checking",  // "checking" | "login" | "biometric" | "remember" | "app"
    loading: true,
    error: null
  });

  // Check session on mount and restore from device memory if available
  useEffect(() => {
    (async () => {
      try {
        // First check if device memory has a valid 24h token
        const deviceToken = window.authModule?.getDeviceMemory?.();
        if (deviceToken) {
          // Device is remembered — auto-login
          const session = await window.authModule.supabase.getSession();
          if (session?.user) {
            initScopedStorage();
            setAuthState({ user: session.user, stage: "app", loading: false, error: null });
            return;
          }
        }

        // No device memory, check if there's an existing session
        const session = await window.authModule.supabase.getSession();
        if (session?.user) {
          // Session exists but device not remembered — show "remember device?" prompt
          initScopedStorage();
          setAuthState({ user: session.user, stage: "remember", loading: false, error: null });
        } else {
          // No session at all — go to login
          setAuthState({ user: null, stage: "login", loading: false, error: null });
        }
      } catch (e) {
        console.error("Auth init failed:", e);
        setAuthState({ user: null, stage: "login", loading: false, error: e.message });
      }
    })();
  }, []);

  // Handle successful login
  const handleLoginSuccess = async (user) => {
    initScopedStorage();
    setAuthState({ user, stage: "biometric", loading: false, error: null });
  };

  // Handle biometric setup complete
  const handleBiometricComplete = () => {
    setAuthState(prev => ({ ...prev, stage: "remember" }));
  };

  // Handle remember device confirmation
  const handleRememberDeviceConfirm = (token) => {
    window.authModule.setDeviceMemory(token);
    setAuthState(prev => ({ ...prev, stage: "app" }));
  };

  // Handle remember device decline
  const handleRememberDeviceDecline = () => {
    setAuthState(prev => ({ ...prev, stage: "app" }));
  };

  // If still checking auth status, show loading
  if (authState.loading || authState.stage === "checking") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        background: "#F2EDDD",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif"
      }
    }, "Loading...");
  }

  // Show login page if not authenticated
  if (!authState.user) {
    return /*#__PURE__*/React.createElement(LoginPage, {
      onLoginSuccess: handleLoginSuccess,
      error: authState.error
    });
  }

  // Show biometric setup after first login
  if (authState.stage === "biometric") {
    return /*#__PURE__*/React.createElement(BiometricSetupPage, {
      userId: authState.user.id,
      onComplete: handleBiometricComplete
    });
  }

  // Show remember device prompt
  if (authState.stage === "remember") {
    return /*#__PURE__*/React.createElement(RememberDevicePrompt, {
      onConfirm: handleRememberDeviceConfirm,
      onDecline: handleRememberDeviceDecline
    });
  }

  // Regular app UI — all authenticated
  // A dedicated hash, separate from the internal "#book" tab, so the customer link
  // and your own internal navigation can never be confused with each other.
  if (window.location.hash.replace("#", "") === "quote") {
    return /*#__PURE__*/React.createElement(PublicQuotePage, null);
  }
  const [tab, setTabState] = useState(getTabFromHash());
  const [pendingCount, setPendingCount] = useState(0);
  const setTab = key => {
    setTabState(key);
    window.location.hash = key;
  };
  useEffect(() => {
    const onHashChange = () => setTabState(getTabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const refreshPendingCount = () => {
    countPendingRequests().then(setPendingCount);
  };
  // Check when the tab changes (covers coming back from Requests after
  // approving/declining) and once on load.
  useEffect(() => {
    refreshPendingCount();
  }, [tab]);
  return /*#__PURE__*/React.createElement(ClientsProvider, null, /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#F2EDDD",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#2A2620",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("link", {
    href: "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
    rel: "stylesheet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 460,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 18px 10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Scissors, {
    size: 20,
    color: "#3E5C2C"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: 18,
      color: "#2D4222"
    }
  }, "Mow Masters of Edmond"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: "8px 18px 90px",
      overflowY: "auto"
    }
  }, tab === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, {
    onRequestsChanged: refreshPendingCount
  }), tab === "clients" && /*#__PURE__*/React.createElement(Clients, null), tab === "sync" && /*#__PURE__*/React.createElement(SyncToBible, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 0,
      width: "100%",
      maxWidth: 460,
      background: "#FBF8F0",
      borderTop: "1px solid #DDD3BC",
      display: "flex",
      padding: "6px 4px"
    }
  }, TABS.map(t => {
    const Icon = t.icon;
    const active = tab === t.key;
    const showBadge = t.key === "dashboard" && pendingCount > 0;
    return /*#__PURE__*/React.createElement("button", {
      key: t.key,
      onClick: () => setTab(t.key),
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "8px 0",
        border: "none",
        background: "none",
        cursor: "pointer",
        color: active ? "#3E5C2C" : "#A69A82"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 18,
      strokeWidth: active ? 2.4 : 2
    }), showBadge && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: -4,
        right: -6,
        minWidth: 14,
        height: 14,
        padding: "0 3px",
        borderRadius: 999,
        background: "#B5602F",
        color: "#fff",
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, pendingCount)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: active ? 600 : 400
      }
    }, t.label));
  })))));
}
