import { useState, useMemo, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://suilwqbpzchshkefvwwy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWx3cWJwemNoc2hrZWZ2d3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzkxMTcsImV4cCI6MjA5NTMxNTExN30.bdI3FcFrISsbLZqhyzpr7uSr2mCUPohlVTnPWSlhFek";

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const RAW_DATA = [
  { client: "BAURAULT", equipment: "1 VIDEOWALL 4x55\"", hall: 1, booth: "STAND 1119 OPTIMA", tech: "" },
  { client: "BAURAULT", equipment: "1 TV 75\"", hall: 1, booth: "STAND 1119 OPTIMA", tech: "" },
  { client: "BAURAULT", equipment: "1 VIDEOWALL 4x55\"", hall: 1, booth: "STAND 1236 MARPOINT", tech: "" },
  { client: "BAURAULT", equipment: "1 TOUCHSCREEN 32\" (ΚΑΘΕΤΑ)", hall: 1, booth: "STAND 1236 MARPOINT", tech: "ΚΑΘΕΤΗ" },
  { client: "BAURAULT", equipment: "2 TOUCHSCREEN 65\" (ΚΑΘΕΤΑ)", hall: 4, booth: "STAND 4109 FRANMAN", tech: "ΚΑΘΕΤΗ" },
  { client: "BAURAULT", equipment: "2 TV 75\" (ΚΑΘΕΤΑ)", hall: 4, booth: "STAND 4109 FRANMAN", tech: "ΚΑΘΕΤΗ" },
  { client: "BAURAULT", equipment: "1 LEDWALL 1.50*1", hall: 4, booth: "STAND 4318 BENEFIT SOFTWARE", tech: "" },
  { client: "MUST DESIGN", equipment: "1x LED 85\"", hall: 3, booth: "ELECTRICA AE, 3559", tech: "" },
  { client: "MUST DESIGN", equipment: "2 MONITOR 65\"", hall: 1, booth: "1.127 PULSA R-PIVOTEL", tech: "" },
  { client: "MUST DESIGN", equipment: "1 MONITOR 85\"", hall: 1, booth: "1.127 PULSA R-PIVOTEL", tech: "" },
  { client: "MUST DESIGN", equipment: "4 ΗΧΕΙΑ", hall: 1, booth: "1.127 PULSA R-PIVOTEL", tech: "" },
  { client: "MUST DESIGN", equipment: "1 ΚΟΝΣΟΛΑ ΗΧΟΥ", hall: 1, booth: "1.127 PULSA R-PIVOTEL", tech: "" },
  { client: "DIGITAL WONDER", equipment: "6 ΟΘΟΝΕΣ TOUCH 55\"", hall: 4, booth: "Japan Hall 4 202", tech: "TOUCH" },
  { client: "DIGITAL WONDER", equipment: "2 ΗΧΕΙΑ", hall: 4, booth: "Japan Hall 4 203", tech: "" },
  { client: "DIGITAL WONDER", equipment: "1 ΚΟΝΣΟΛΑ ΗΧΟΥ", hall: 4, booth: "Japan Hall 4 204", tech: "" },
  { client: "DIGITAL WONDER", equipment: "2 ΑΣΥΡΜΑΤΑ ΜΙΚΡΟΦΩΝΑ", hall: 4, booth: "Japan Hall 4 205", tech: "" },
  { client: "DIGITAL WONDER", equipment: "1 GOOSENECK", hall: 4, booth: "Japan Hall 4 206", tech: "" },
  { client: "DIGITAL WONDER", equipment: "1 PODIUM", hall: 4, booth: "Japan Hall 4 207", tech: "" },
  { client: "DIGITAL WONDER", equipment: "1 LAPTOP", hall: 4, booth: "Japan Hall 4 208", tech: "" },
  { client: "TWOSIX ARCHITECTS", equipment: "LEDWALL 4*2.5", hall: 3, booth: "HALL 3 ΠΕΡ 213 WILHELMSEN", tech: "" },
  { client: "TWOSIX ARCHITECTS", equipment: "2 ΟΘΟΝΕΣ 65\"", hall: 3, booth: "HALL 3 ΠΕΡ 213 WILHELMSEN", tech: "" },
  { client: "TWOSIX ARCHITECTS", equipment: "1 ΚΟΝΣΟΛΑ ΗΧΟΥ", hall: 3, booth: "HALL 3 ΠΕΡ 213 WILHELMSEN", tech: "" },
  { client: "TWOSIX ARCHITECTS", equipment: "2 ΗΧΕΙΑ ΜΙΚΡΑ", hall: 3, booth: "HALL 3 ΠΕΡ 213 WILHELMSEN", tech: "" },
  { client: "TWOSIX ARCHITECTS", equipment: "3 ΜΙΚΡΟΦΩΝΑ ΜΕ ΧΕΙΡΙΣΤΗ", hall: 3, booth: "HALL 3 ΠΕΡ 213 WILHELMSEN", tech: "" },
  { client: "VISION", equipment: "LED ΚΡΕΜΑΣΤΟ ΣΕ ΣΧΗΜΑ ΠΛΩΡΗΣ", hall: 2, booth: "ONEX 2.323", tech: "" },
  { client: "VISION", equipment: "LED ΠΑΤΩΜΑ 10*1", hall: 2, booth: "ONEX 2.323", tech: "" },
  { client: "VISION", equipment: "LEDWALL 3.5*2", hall: 2, booth: "ONEX 2.323", tech: "" },
  { client: "VISION", equipment: "2X TV 55\" + HDMI", hall: 2, booth: "ONEX 2.323", tech: "" },
  { client: "VISION", equipment: "1x 85\" TV", hall: 3, booth: "SEA POWER 3.519", tech: "" },
  { client: "VISION", equipment: "1x LEDWALL 2.5X1.5", hall: 4, booth: "ROSS MARINE HALL4-ST.4.117", tech: "" },
  { client: "VISION", equipment: "2X TV 55\"", hall: 4, booth: "ROSS MARINE HALL4-ST.4.117", tech: "" },
  { client: "VISION", equipment: "1X TV 43\"", hall: 1, booth: "ABB HALL1 ST.1.113", tech: "" },
  { client: "VISION", equipment: "1X TV 65\"", hall: 1, booth: "ABB HALL1 ST.1.113", tech: "" },
  { client: "VISION", equipment: "2X TV 55\"", hall: 1, booth: "ABB HALL1 ST.1.113", tech: "" },
  { client: "VISION", equipment: "1X TV 100\"", hall: 4, booth: "POLYGREEN HALL4 ST.4.110", tech: "" },
  { client: "VISION", equipment: "1X LEDWALL 2.5X1.5", hall: 2, booth: "EUPLOIA HALL2-ST.2.101", tech: "" },
  { client: "VISION", equipment: "1X TV 43\"", hall: 2, booth: "EUPLOIA HALL2-ST.2.101", tech: "" },
  { client: "VISION", equipment: "1X TV 100\"", hall: 2, booth: "ACCELERON HALL2-ST.2.303", tech: "" },
  { client: "VISION", equipment: "1X TV 55\" + HDMI", hall: 2, booth: "ACCELERON HALL2-ST.2.303", tech: "" },
  { client: "VISION", equipment: "1 ΔΗΜΙΟΥΡΓΙΑ ETHERNET WIFI", hall: 2, booth: "ACCELERON HALL2-ST.2.303", tech: "" },
  { client: "VISION", equipment: "1X TV 85\"", hall: 1, booth: "DYNAMIC protasis HALL1-ST.1.128", tech: "" },
  { client: "VISION", equipment: "1x 43\" ΕΠΙΤΡΑΠΕΖΙΑ ΟΘΟΝΗ", hall: 4, booth: "JSMEA HALL 4.101 & 4.205", tech: "" },
  { client: "VISION", equipment: "5x 55\"", hall: 4, booth: "JSMEA HALL 4.101 & 4.205", tech: "" },
  { client: "VISION", equipment: "2x 55\" TOUCH ΚΑΘΕΤΑ", hall: 4, booth: "JSMEA HALL 4.101 & 4.205", tech: "ΚΑΘΕΤΗ" },
  { client: "VISION", equipment: "4x 55\"", hall: 4, booth: "JSMEA HALL 4.101 & 4.206", tech: "" },
  { client: "DEEZEN", equipment: "LEDWALL 3.5*2", hall: 4, booth: "ΣΚΑΡΑΜΑΓΚΑΣ 4307", tech: "" },
  { client: "DEEZEN", equipment: "1 ΟΘΟΝΗ 65\"", hall: 4, booth: "ΣΚΑΡΑΜΑΓΚΑΣ 4307", tech: "" },
  { client: "DEEZEN", equipment: "LEDWALL 3.5*2", hall: 4, booth: "NAVARINO 4301", tech: "" },
  { client: "DEEZEN", equipment: "ΗΧΗΤΙΚΗ ΕΓΚΑΤΑΣΤΑΣΗ + ΜΙΚΡΟΦΩΝΑ", hall: 4, booth: "NAVARINO 4301", tech: "" },
  { client: "DEEZEN", equipment: "ΚΟΝΣΟΛΑ ΗΧΟΥ", hall: 4, booth: "NAVARINO 4301", tech: "" },
  { client: "DEEZEN", equipment: "2 ΟΘΟΝΕΣ 42\"", hall: 4, booth: "NAVARINO 4301", tech: "" },
  { client: "DEEZEN", equipment: "1 ΟΘΟΝΗ 65\"", hall: 4, booth: "SevenSeas 4232", tech: "" },
  { client: "DEEZEN", equipment: "1 ΟΘΟΝΗ 100\"", hall: 1, booth: "HARLAS 1226", tech: "" },
  { client: "DEEZEN", equipment: "1 ΟΘΟΝΗ 65\"", hall: 1, booth: "HARLAS 1226", tech: "" },
  { client: "DEEZEN", equipment: "1 ΟΘΟΝΗ 55\"", hall: 4, booth: "WICKERS 4120", tech: "" },
  { client: "DEEZEN", equipment: "1 ΟΘΟΝΗ 75\"", hall: 2, booth: "ΑΝΕΜΗ 2157", tech: "" },
  { client: "DEEZEN", equipment: "4 ΟΘΟΝΕΣ 43\"", hall: 2, booth: "ΑΝΕΜΗ 2157", tech: "" },
  { client: "DEEZEN", equipment: "1 TOUCH 32\"", hall: 2, booth: "ΑΝΕΜΗ 2157", tech: "" },
  { client: "DEEZEN", equipment: "1 ΟΘΟΝΗ 65\"", hall: 2, booth: "AGV 2139", tech: "" },
  { client: "DEEZEN", equipment: "1 ΟΘΟΝΗ 75\"", hall: 2, booth: "AGV 2139", tech: "" },
  { client: "PROKAKI", equipment: "1x LEDWALL 3.5*2", hall: 2, booth: "2-111 TURBOMARE", tech: "" },
  { client: "PROKAKI", equipment: "2 LEDWALL 1*1.5", hall: 1, booth: "1-217 BSM", tech: "" },
  { client: "PROKAKI", equipment: "1x CURVED LEDWALL 8*3", hall: 3, booth: "3-102 WARTSILA", tech: "ΚΑΜΠΥΛΗ" },
  { client: "PROKAKI", equipment: "1x MONITOR TOUCH 42\"", hall: 3, booth: "3-102 WARTSILA", tech: "ΜΕ ΜΙΝΙ PC" },
  { client: "PROKAKI", equipment: "1 LAPTOP", hall: 3, booth: "3-102 WARTSILA", tech: "" },
  { client: "PROKAKI", equipment: "2x MONITOR 42\"", hall: 3, booth: "3-102 WARTSILA", tech: "" },
  { client: "PROKAKI", equipment: "2x LAPTOP", hall: 3, booth: "3-102 WARTSILA", tech: "" },
  { client: "PROKAKI", equipment: "1x LEDWALL ΓΩΝΙΑ 5.50*2", hall: 3, booth: "3-311 VIOHALCO", tech: "ΓΩΝΙΑ" },
  { client: "PROKAKI", equipment: "1x MONITOR 55\" ME USB", hall: 4, booth: "CROSS 4116", tech: "ΜΕ USB" },
  { client: "PROKAKI", equipment: "1x MONITOR TOUCH 55\"", hall: 4, booth: "CROSS 4116", tech: "TOUCH" },
  { client: "PROKAKI", equipment: "1x LEDWALL 3.5*1.5", hall: 1, booth: "RADIO HOLLAND 1.213", tech: "" },
  { client: "PROKAKI", equipment: "2 ΗΧΕΙΑ", hall: 1, booth: "RADIO HOLLAND 1.213", tech: "" },
  { client: "OCTAPUS", equipment: "1 MONITOR TOUCH 55\" + ΒΑΣΗ ΤΟΙΧΟΥ", hall: 3, booth: "Stand 3.505-AUSTRAL", tech: "TOUCH" },
  { client: "OCTAPUS", equipment: "1 MONITOR 85\" + ΒΑΣΗ ΤΟΙΧΟΥ", hall: 3, booth: "Stand 3.505-AUSTRAL", tech: "" },
  { client: "OCTAPUS", equipment: "3 MONITOR 65\" + ΒΑΣΗ ΤΟΙΧΟΥ", hall: 1, booth: "1.351 ONETECH", tech: "" },
  { client: "OCTAPUS", equipment: "5 MONITOR 42\" + ΒΑΣΗ ΤΟΙΧΟΥ", hall: 1, booth: "1.351 ONETECH", tech: "" },
  { client: "OCTAPUS", equipment: "LEDWALL 2.5*4", hall: 1, booth: "1.351 ONETECH", tech: "" },
  { client: "OCTAPUS", equipment: "1 MONITOR 55\"", hall: 1, booth: "1.351 ONETECH", tech: "" },
  { client: "OCTAPUS", equipment: "1 MONITOR 55\" ΚΑΘΕΤΗ", hall: 1, booth: "1.351 ONETECH", tech: "ΚΑΘΕΤΗ" },
  { client: "OCTAPUS", equipment: "LEDWALL 2*1.5", hall: 1, booth: "1.351 ONETECH", tech: "" },
  { client: "STUDIO IMAGE EXPO", equipment: "1 LEDWALL ΓΩΝΙΑ 2.5*1*1.5", hall: 1, booth: "ΤΟΥΡΚΟΣ Hall 1-203", tech: "ΓΩΝΙΑ" },
  { client: "STUDIO IMAGE EXPO", equipment: "1 MONITOR 55\"", hall: 1, booth: "ΤΟΥΡΚΟΣ Hall 1-203", tech: "" },
  { client: "STUDIO IMAGE EXPO", equipment: "1 MONITOR 65\" ΕΠΙΤΟΙΧΙΑ", hall: 3, booth: "DSR Hall 3 no3268", tech: "" },
  { client: "STUDIO IMAGE EXPO", equipment: "TABLET + ΒΑΣΗ ΤΑΜΠΛΕΤ", hall: 3, booth: "DSR Hall 3 no3268", tech: "" },
];

function groupByBooth(data) {
  const map = {};
  data.forEach(row => {
    const key = `${row.hall}__${row.booth}__${row.client}`.replace(/[^a-zA-Z0-9_\u0370-\u03FF]/g, "_");
    if (!map[key]) {
      map[key] = { id: key, client: row.client, hall: row.hall, booth: row.booth, items: [], done: false, notes: "" };
    }
    map[key].items.push({ equipment: row.equipment, tech: row.tech });
  });
  return Object.values(map).sort((a, b) => a.hall - b.hall || a.booth.localeCompare(b.booth));
}

const HALL_COLORS = {
  1: { bg: "#1a3a5c", accent: "#4da6ff", label: "HALL 1" },
  2: { bg: "#1a4a3a", accent: "#4dffa6", label: "HALL 2" },
  3: { bg: "#4a2a1a", accent: "#ffaa4d", label: "HALL 3" },
  4: { bg: "#3a1a4a", accent: "#cc88ff", label: "HALL 4" },
};

const CLIENT_COLORS = {
  "BAURAULT": "#e74c3c", "MUST DESIGN": "#e67e22", "DIGITAL WONDER": "#f1c40f",
  "TWOSIX ARCHITECTS": "#2ecc71", "VISION": "#3498db", "DEEZEN": "#9b59b6",
  "PROKAKI": "#1abc9c", "OCTAPUS": "#e91e63", "STUDIO IMAGE EXPO": "#ff5722",
};

export default function App() {
  const baseBoohs = useMemo(() => groupByBooth(RAW_DATA), []);
  const [booths, setBooths] = useState(baseBoohs);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [search, setSearch] = useState("");
  const [filterHall, setFilterHall] = useState("ALL");
  const [filterClient, setFilterClient] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [view, setView] = useState("grid");

  const clients = useMemo(() => [...new Set(RAW_DATA.map(r => r.client))].sort(), []);

  // Load from Supabase on mount
  const loadFromDB = useCallback(async () => {
    try {
      const rows = await sbFetch("booth_status?select=id,done,notes");
      setBooths(prev => prev.map(b => {
        const dbRow = rows.find(r => r.id === b.id);
        return dbRow ? { ...b, done: dbRow.done, notes: dbRow.notes || "" } : b;
      }));
      setLastSync(new Date());
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  // Poll every 15 seconds for team updates
  useEffect(() => {
    const interval = setInterval(loadFromDB, 15000);
    return () => clearInterval(interval);
  }, [loadFromDB]);

  const upsertBooth = async (id, done, notes) => {
    await sbFetch("booth_status", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id, done, notes, updated_at: new Date().toISOString() }),
    });
  };

  const toggleDone = async (id) => {
    const booth = booths.find(b => b.id === id);
    const newDone = !booth.done;
    setBooths(prev => prev.map(b => b.id === id ? { ...b, done: newDone } : b));
    if (selectedBooth?.id === id) setSelectedBooth(prev => ({ ...prev, done: newDone }));
    setSyncing(true);
    try {
      await upsertBooth(id, newDone, booth.notes);
      setLastSync(new Date());
    } catch (e) { console.error(e); }
    setSyncing(false);
  };

  const saveNote = async () => {
    const booth = booths.find(b => b.id === selectedBooth.id);
    setBooths(prev => prev.map(b => b.id === selectedBooth.id ? { ...b, notes: noteInput } : b));
    setSelectedBooth(prev => ({ ...prev, notes: noteInput }));
    setSyncing(true);
    try {
      await upsertBooth(selectedBooth.id, booth.done, noteInput);
      setLastSync(new Date());
    } catch (e) { console.error(e); }
    setSyncing(false);
  };

  const openBooth = (booth) => { setSelectedBooth(booth); setNoteInput(booth.notes || ""); };

  const filtered = useMemo(() => booths.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.booth.toLowerCase().includes(q) || b.client.toLowerCase().includes(q) || b.items.some(i => i.equipment.toLowerCase().includes(q));
    const matchHall = filterHall === "ALL" || b.hall === parseInt(filterHall);
    const matchClient = filterClient === "ALL" || b.client === filterClient;
    const matchStatus = filterStatus === "ALL" || (filterStatus === "DONE" ? b.done : !b.done);
    return matchSearch && matchHall && matchClient && matchStatus;
  }), [booths, search, filterHall, filterClient, filterStatus]);

  const stats = useMemo(() => ({
    total: booths.length,
    done: booths.filter(b => b.done).length,
    halls: [1, 2, 3, 4].map(h => ({ hall: h, total: booths.filter(b => b.hall === h).length, done: booths.filter(b => b.hall === h && b.done).length })),
  }), [booths]);

  const pct = Math.round((stats.done / stats.total) * 100);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'DM Mono','Courier New',monospace" }}>
      <div style={{ fontSize: 32 }}>⚓</div>
      <div style={{ color: "#4da6ff", letterSpacing: 3, fontSize: 13 }}>LOADING POSIDONIA 2026...</div>
      <div style={{ color: "#2a4a6a", fontSize: 11 }}>Syncing with team database</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e8ecf4", fontFamily: "'DM Mono','Courier New',monospace" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0d1b3e 0%,#0a0e1a 60%)", borderBottom: "1px solid #1e3a6e", padding: "20px 24px 16px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: "#4da6ff" }}>⚓ POSIDONIA</span>
              <span style={{ fontSize: 13, color: "#5a7a9a", letterSpacing: 2 }}>2026</span>
              {/* Sync indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: syncing ? "#f1c40f" : "#4dffa6", boxShadow: `0 0 6px ${syncing ? "#f1c40f" : "#4dffa6"}`, transition: "all 0.3s" }} />
                <span style={{ fontSize: 9, color: "#3a5a7a", letterSpacing: 1 }}>
                  {syncing ? "SYNCING..." : lastSync ? `SYNCED ${lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "LIVE"}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#4a6a8a", letterSpacing: 2, marginTop: 2 }}>AV EXHIBITION TRACKER · TEAM SYNC ENABLED</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: pct === 100 ? "#4dffa6" : "#4da6ff", lineHeight: 1 }}>
                {stats.done}<span style={{ fontSize: 14, color: "#4a6a8a" }}>/{stats.total}</span>
              </div>
              <div style={{ fontSize: 10, color: "#4a6a8a", letterSpacing: 2 }}>BOOTHS DONE</div>
            </div>
            <div style={{ width: 64, height: 64, position: "relative" }}>
              <svg viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1e3a6e" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={pct === 100 ? "#4dffa6" : "#4da6ff"} strokeWidth="6"
                  strokeDasharray={`${pct * 1.759} 175.9`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#4da6ff" }}>{pct}%</div>
            </div>
          </div>
        </div>
        {/* Hall pills */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {stats.halls.map(h => {
            const c = HALL_COLORS[h.hall];
            const hp = h.total > 0 ? Math.round((h.done / h.total) * 100) : 0;
            return (
              <div key={h.hall} onClick={() => setFilterHall(filterHall === String(h.hall) ? "ALL" : String(h.hall))}
                style={{ background: filterHall === String(h.hall) ? c.bg : "#111827", border: `1px solid ${filterHall === String(h.hall) ? c.accent : "#1e3a6e"}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: c.accent }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "#ccc", marginTop: 2 }}>{h.done}/{h.total} <span style={{ color: "#5a7a9a" }}>{hp}%</span></div>
              </div>
            );
          })}
          <div onClick={loadFromDB} style={{ background: "#111827", border: "1px solid #1e3a6e", borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 12 }}>🔄</span>
            <span style={{ fontSize: 10, color: "#4a6a8a", letterSpacing: 1 }}>REFRESH</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "12px 24px", background: "#080c18", borderBottom: "1px solid #131c30", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search booth, client, equipment..."
          style={{ background: "#111827", border: "1px solid #1e3a6e", color: "#e8ecf4", borderRadius: 6, padding: "7px 12px", fontSize: 12, width: 260, outline: "none", fontFamily: "inherit" }} />
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
          style={{ background: "#111827", border: "1px solid #1e3a6e", color: "#e8ecf4", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "inherit" }}>
          <option value="ALL">All Clients</option>
          {clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: "#111827", border: "1px solid #1e3a6e", color: "#e8ecf4", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "inherit" }}>
          <option value="ALL">All Status</option>
          <option value="DONE">✅ Done</option>
          <option value="PENDING">⏳ Pending</option>
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {["grid", "list"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ background: view === v ? "#1e3a6e" : "#111827", border: `1px solid ${view === v ? "#4da6ff" : "#1e3a6e"}`, color: view === v ? "#4da6ff" : "#5a7a9a", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11, letterSpacing: 1, fontFamily: "inherit" }}>
              {v === "grid" ? "⊞ GRID" : "☰ LIST"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "8px 24px", fontSize: 11, color: "#4a6a8a", letterSpacing: 1 }}>
        SHOWING {filtered.length} BOOTH{filtered.length !== 1 ? "S" : ""}{filtered.length !== booths.length && ` OF ${booths.length}`}
      </div>

      {/* Grid/List */}
      <div style={{ padding: "0 24px 40px", display: view === "grid" ? "grid" : "flex", flexDirection: view === "list" ? "column" : undefined, gridTemplateColumns: view === "grid" ? "repeat(auto-fill,minmax(280px,1fr))" : undefined, gap: 12 }}>
        {filtered.map(booth => {
          const hc = HALL_COLORS[booth.hall];
          const cc = CLIENT_COLORS[booth.client] || "#888";
          return (
            <div key={booth.id} onClick={() => openBooth(booth)}
              style={{ background: booth.done ? "linear-gradient(135deg,#0d2010 0%,#0a150a 100%)" : "linear-gradient(135deg,#111827 0%,#0d1120 100%)", border: `1px solid ${booth.done ? "#2d6a2d" : "#1e3a6e"}`, borderLeft: `3px solid ${booth.done ? "#4dffa6" : hc.accent}`, borderRadius: 10, padding: view === "grid" ? "14px 16px" : "10px 16px", cursor: "pointer", transition: "all 0.2s", position: "relative", display: view === "list" ? "flex" : "block", alignItems: view === "list" ? "center" : undefined, gap: view === "list" ? 16 : undefined }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              {booth.done && <div style={{ position: "absolute", top: 10, right: 10, background: "#1a4a1a", color: "#4dffa6", fontSize: 10, letterSpacing: 1, padding: "2px 7px", borderRadius: 4, border: "1px solid #2d6a2d" }}>✓ DONE</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: view === "grid" ? 6 : 0, flexShrink: 0 }}>
                <span style={{ background: hc.bg, color: hc.accent, fontSize: 9, letterSpacing: 1, padding: "2px 6px", borderRadius: 4, border: `1px solid ${hc.accent}40`, whiteSpace: "nowrap" }}>H{booth.hall}</span>
                <span style={{ background: `${cc}22`, color: cc, fontSize: 9, letterSpacing: 1, padding: "2px 6px", borderRadius: 4, border: `1px solid ${cc}44`, whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>{booth.client}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: booth.done ? "#4dffa6" : "#c8d8f0", lineHeight: 1.3, marginBottom: view === "grid" ? 6 : 0, whiteSpace: view === "list" ? "nowrap" : undefined, overflow: view === "list" ? "hidden" : undefined, textOverflow: view === "list" ? "ellipsis" : undefined, maxWidth: view === "list" ? 220 : undefined }}>{booth.booth}</div>
                {view === "grid" && (
                  <div style={{ fontSize: 10, color: "#4a6a8a", lineHeight: 1.6 }}>
                    {booth.items.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 4 }}>
                        <span style={{ color: "#2a4a6a" }}>›</span>
                        <span style={{ color: "#7a9ab8" }}>{item.equipment}{item.tech ? ` (${item.tech})` : ""}</span>
                      </div>
                    ))}
                    {booth.items.length > 3 && <div style={{ color: "#3a5a7a", fontSize: 9, marginTop: 2 }}>+{booth.items.length - 3} more items</div>}
                  </div>
                )}
              </div>
              {view === "list" && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}><span style={{ fontSize: 10, color: "#4a6a8a" }}>{booth.items.length} items</span>{booth.notes && <span style={{ fontSize: 10, color: "#f1c40f" }}>📝</span>}</div>}
              {view === "grid" && booth.notes && <div style={{ marginTop: 6, fontSize: 10, color: "#f1c40f", background: "#2a2010", borderRadius: 4, padding: "4px 8px" }}>📝 {booth.notes.length > 50 ? booth.notes.slice(0, 50) + "…" : booth.notes}</div>}
              {view === "grid" && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #1e3a6e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#3a5a7a" }}>{booth.items.length} items</span>
                  <button onClick={e => { e.stopPropagation(); toggleDone(booth.id); }}
                    style={{ background: booth.done ? "#1a4a1a" : "#1e3a6e", color: booth.done ? "#4dffa6" : "#4da6ff", border: `1px solid ${booth.done ? "#2d6a2d" : "#2a5a9e"}`, borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 10, letterSpacing: 1, fontFamily: "inherit", transition: "all 0.2s" }}>
                    {booth.done ? "✓ DONE" : "MARK DONE"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedBooth && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }} onClick={() => setSelectedBooth(null)}>
          <div style={{ background: "#0d1120", border: `1px solid ${selectedBooth.done ? "#2d6a2d" : "#1e3a6e"}`, borderTop: `3px solid ${selectedBooth.done ? "#4dffa6" : HALL_COLORS[selectedBooth.hall].accent}`, borderRadius: 14, padding: 28, maxWidth: 540, width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ background: HALL_COLORS[selectedBooth.hall].bg, color: HALL_COLORS[selectedBooth.hall].accent, fontSize: 10, letterSpacing: 2, padding: "3px 8px", borderRadius: 4, border: `1px solid ${HALL_COLORS[selectedBooth.hall].accent}40` }}>HALL {selectedBooth.hall}</span>
                  <span style={{ background: `${CLIENT_COLORS[selectedBooth.client] || "#888"}22`, color: CLIENT_COLORS[selectedBooth.client] || "#888", fontSize: 10, letterSpacing: 1, padding: "3px 8px", borderRadius: 4 }}>{selectedBooth.client}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#e8ecf4", lineHeight: 1.3 }}>{selectedBooth.booth}</div>
              </div>
              <button onClick={() => setSelectedBooth(null)} style={{ background: "none", border: "none", color: "#4a6a8a", cursor: "pointer", fontSize: 20, padding: "0 4px" }}>✕</button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#4a6a8a", letterSpacing: 2, marginBottom: 10 }}>EQUIPMENT ({selectedBooth.items.length} items)</div>
              {selectedBooth.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px", marginBottom: 4, background: "#111827", borderRadius: 6, border: "1px solid #1a2a4a" }}>
                  <span style={{ color: "#2a5a8a", fontSize: 12, marginTop: 1 }}>›</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, color: "#c8d8f0" }}>{item.equipment}</span>
                    {item.tech && <span style={{ marginLeft: 8, fontSize: 10, color: "#f1c40f", background: "#2a2010", padding: "1px 6px", borderRadius: 3 }}>{item.tech}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#4a6a8a", letterSpacing: 2, marginBottom: 8 }}>NOTES</div>
              <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add installation notes, issues, special instructions..."
                style={{ width: "100%", minHeight: 80, background: "#111827", border: "1px solid #1e3a6e", color: "#e8ecf4", borderRadius: 6, padding: 10, fontSize: 12, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              <button onClick={saveNote} style={{ marginTop: 6, background: "#1e3a6e", color: "#4da6ff", border: "1px solid #2a5a9e", borderRadius: 5, padding: "6px 14px", cursor: "pointer", fontSize: 11, letterSpacing: 1, fontFamily: "inherit" }}>
                {syncing ? "SAVING..." : "SAVE NOTE"}
              </button>
            </div>
            <button onClick={() => toggleDone(selectedBooth.id)}
              style={{ width: "100%", padding: "12px", background: selectedBooth.done ? "linear-gradient(135deg,#1a4a1a,#0d2010)" : "linear-gradient(135deg,#1e4a8e,#0d2050)", color: selectedBooth.done ? "#4dffa6" : "#4da6ff", border: `1px solid ${selectedBooth.done ? "#2d6a2d" : "#2a5a9e"}`, borderRadius: 8, cursor: "pointer", fontSize: 13, letterSpacing: 2, fontFamily: "inherit", fontWeight: 700, transition: "all 0.2s" }}>
              {selectedBooth.done ? "✓ MARKED AS DONE — CLICK TO UNDO" : "✓ MARK BOOTH AS DONE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
