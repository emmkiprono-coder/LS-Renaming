import { useState, useCallback } from "react";

/* ───────── JSONBin config ───────── */
const JSONBIN_API_KEY = "$2a$10$M6W9ulyMKcxTdIcDcjhuVOm12ccNO2UeYG9e581pkl4mA3aX5Dvu.";
const VOTES_BIN = "69aa576043b1c97be9b88a93";

async function saveVote(entry: Record<string, unknown>) {
  /* 1. Read current array */
  const getRes = await fetch(`https://api.jsonbin.io/v3/b/${VOTES_BIN}/latest`, {
    headers: { "X-Access-Key": JSONBIN_API_KEY },
  });
  if (!getRes.ok) throw new Error(`Read failed: ${getRes.status}`);
  const data = await getRes.json();
  const existing: unknown[] = Array.isArray(data.record) ? data.record : [];

  /* 2. Append new entry (filter out _init placeholder) */
  const cleaned = existing.filter(
    (r: any) => !(r && typeof r === "object" && "_init" in r)
  );
  cleaned.push({ ...entry, votedAt: new Date().toISOString() });

  /* 3. Write back */
  const putRes = await fetch(`https://api.jsonbin.io/v3/b/${VOTES_BIN}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": JSONBIN_API_KEY,
    },
    body: JSON.stringify(cleaned),
  });
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(err.message || `Save failed: ${putRes.status}`);
  }
}

const FINALISTS = [
  { id: 1, name: "Finalist Name 1", submitter: "Submitter A", summary: "A brief one-sentence rationale for this name." },
  { id: 2, name: "Finalist Name 2", submitter: "Submitter B", summary: "A brief one-sentence rationale for this name." },
  { id: 3, name: "Finalist Name 3", submitter: "Submitter C", summary: "A brief one-sentence rationale for this name." },
  { id: 4, name: "Finalist Name 4", submitter: "Submitter D", summary: "A brief one-sentence rationale for this name." },
  { id: 5, name: "Finalist Name 5", submitter: "Submitter E", summary: "A brief one-sentence rationale for this name." },
];

const RANK_COLORS: Record<number, { badge: string; card: string; shadow: string }> = {
  1: {
    badge: "linear-gradient(135deg, #6366f1, #4f46e5)",
    card: "linear-gradient(135deg, rgba(238,242,255,0.9), rgba(224,231,255,0.7))",
    shadow: "0 4px 20px rgba(99,102,241,0.12)",
  },
  2: {
    badge: "linear-gradient(135deg, #0ea5e9, #0891b2)",
    card: "linear-gradient(135deg, rgba(207,250,254,0.7), rgba(204,251,241,0.5))",
    shadow: "0 4px 20px rgba(14,165,233,0.1)",
  },
  3: {
    badge: "linear-gradient(135deg, #14b8a6, #059669)",
    card: "linear-gradient(135deg, rgba(204,251,241,0.7), rgba(209,250,229,0.5))",
    shadow: "0 4px 20px rgba(20,184,166,0.1)",
  },
};

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: RANK_COLORS[rank]?.badge || "#e5e7eb",
        color: "white",
        fontSize: 13,
        fontWeight: 800,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {rank}
    </span>
  );
}

export default function App() {
  const [voterName, setVoterName] = useState("");
  const [ranked, setRanked] = useState<number[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [nameError, setNameError] = useState(false);
  const [rankError, setRankError] = useState(false);

  const toggleRank = useCallback((id: number) => {
    setRanked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
    setRankError(false);
  }, []);

  const getRank = (id: number) => {
    const idx = ranked.indexOf(id);
    return idx === -1 ? null : idx + 1;
  };

  const submit = async () => {
    let bad = false;
    if (!voterName.trim()) { setNameError(true); bad = true; }
    if (ranked.length < 3) { setRankError(true); bad = true; }
    if (bad) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await saveVote({
        voterName,
        rank1: FINALISTS.find((f) => f.id === ranked[0])?.name ?? "",
        rank2: FINALISTS.find((f) => f.id === ranked[1])?.name ?? "",
        rank3: FINALISTS.find((f) => f.id === ranked[2])?.name ?? "",
        comment,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Vote submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

  const inputStyle = (error?: boolean): React.CSSProperties => ({
    width: "100%",
    borderRadius: 14,
    border: `1.5px solid ${error ? "#fca5a5" : "#c7d2fe"}`,
    background: error ? "#fef2f2" : "rgba(255,255,255,0.7)",
    padding: "12px 16px",
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box" as const,
  });

  if (submitted) {
    return (
      <div
        style={{
          fontFamily: FONT,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "linear-gradient(150deg, #e0e7ff 0%, #ccfbf1 50%, #fae8ff 100%)",
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.8)",
            padding: 48,
            boxShadow: "0 8px 32px rgba(99,102,241,0.1)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #d1fae5, #ccfbf1)",
              border: "1px solid #6ee7b7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Vote recorded.</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Thank you, <span style={{ color: "#1e293b", fontWeight: 600 }}>{voterName}</span>. The results will be announced soon.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", marginBottom: 24 }}>
            <p style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Your Rankings</p>
            {ranked.map((id, idx) => {
              const f = FINALISTS.find((x) => x.id === id)!;
              const colors = RANK_COLORS[idx + 1];
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderRadius: 14,
                    padding: "12px 16px",
                    background: colors?.card || "#f9fafb",
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: colors?.shadow || "none",
                  }}
                >
                  <RankBadge rank={idx + 1} />
                  <span style={{ color: "#1e293b", fontWeight: 600, fontSize: 14 }}>{f.name}</span>
                </div>
              );
            })}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic" }}>
            "Every voice matters in shaping who we become together."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: FONT,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #e0e7ff 0%, #ede9fe 15%, #f5f3ff 30%, #f0fdfa 50%, #ecfdf5 65%, #fdf4ff 80%, #fae8ff 100%)",
      }}
    >
      {/* nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(224,231,255,0.75)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(199,210,254,0.5)",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: 1.5, textTransform: "uppercase" }}>Advocate Health</span>
          <span style={{ fontSize: 11, color: "#818cf8", fontWeight: 500 }}>Language Services</span>
        </div>
      </nav>

      {/* hero */}
      <header style={{ paddingTop: 64, paddingBottom: 40, textAlign: "center", paddingLeft: 24, paddingRight: 24 }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
            color: "white",
            padding: "6px 16px",
            borderRadius: 100,
            marginBottom: 16,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Cast Your Vote
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 52px)", fontWeight: 800, color: "#1e1b4b", letterSpacing: -1.5, marginBottom: 12, lineHeight: 1.1 }}>
          Choose our name.
        </h1>
        <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
          The Unity Committee selected 5 finalists. Rank your top 3 to decide our new team identity.
        </p>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", paddingBottom: 80 }}>
        {/* instructions */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(238,242,255,0.8), rgba(207,250,254,0.4))",
            backdropFilter: "blur(16px)",
            borderRadius: 20,
            border: "1px solid rgba(165,180,252,0.3)",
            padding: 22,
            marginBottom: 32,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #c7d2fe, #a5b4fc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#312e81", marginBottom: 2 }}>How to vote</p>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              Tap finalists in order of preference. First tap = #1, second = #2, third = #3. Tap again to deselect.
            </p>
          </div>
        </div>

        {/* voter name */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(238,242,255,0.8), rgba(224,231,255,0.5))",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.6)",
            padding: 28,
            marginBottom: 32,
            boxShadow: "0 1px 3px rgba(99,102,241,0.06)",
          }}
        >
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
            Your Name
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6366f1", marginLeft: 4, verticalAlign: "super", fontSize: 0 }} />
          </label>
          <input
            type="text"
            value={voterName}
            onChange={(e) => { setVoterName(e.target.value); setNameError(false); }}
            placeholder="Jane Doe"
            style={inputStyle(nameError)}
            onFocus={(e) => { e.target.style.borderColor = "#818cf8"; e.target.style.boxShadow = "0 0 0 3px rgba(129,140,248,0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = nameError ? "#fca5a5" : "#c7d2fe"; e.target.style.boxShadow = "none"; }}
          />
          {nameError && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4, fontWeight: 500 }}>This field is required.</p>}
        </div>

        {/* selection counter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 4px" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#312e81" }}>Top 5 Finalists</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: ranked.length >= n ? RANK_COLORS[n]?.badge || "#d1d5db" : "#d1d5db",
                  transition: "all 0.3s ease",
                  boxShadow: ranked.length >= n ? "0 2px 6px rgba(99,102,241,0.25)" : "none",
                }}
              />
            ))}
            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4, fontVariantNumeric: "tabular-nums" }}>
              {ranked.length}/3
            </span>
          </div>
        </div>
        {rankError && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, padding: "0 4px", fontWeight: 500 }}>Please select exactly 3 finalists.</p>}

        {/* finalist cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {FINALISTS.map((f) => {
            const rank = getRank(f.id);
            const selected = rank !== null;
            const disabled = !selected && ranked.length >= 3;
            const colors = selected ? RANK_COLORS[rank!] : null;

            return (
              <button
                key={f.id}
                onClick={() => toggleRank(f.id)}
                disabled={disabled}
                style={{
                  width: "100%",
                  textAlign: "left",
                  borderRadius: 20,
                  border: selected ? "1.5px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.6)",
                  background: selected
                    ? colors?.card || "#f9fafb"
                    : disabled
                    ? "rgba(241,245,249,0.4)"
                    : "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(16px)",
                  padding: 22,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.35 : 1,
                  boxShadow: selected ? colors?.shadow || "none" : "0 1px 3px rgba(99,102,241,0.04)",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
              >
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {selected ? (
                    <RankBadge rank={rank!} />
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "2px solid #c7d2fe",
                        transition: "border-color 0.2s",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 16, color: selected ? "#1e293b" : "#475569" }}>
                    {f.name}
                  </p>
                  <p style={{ color: "#a5b4fc", fontSize: 12, marginTop: 2, fontWeight: 500 }}>
                    Submitted by {f.submitter}
                  </p>
                  <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.6, color: selected ? "#475569" : "#94a3b8" }}>
                    {f.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* optional comment */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(250,232,255,0.5), rgba(237,233,254,0.5))",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.6)",
            padding: 28,
            marginBottom: 40,
            boxShadow: "0 1px 3px rgba(124,58,237,0.04)",
          }}
        >
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>
            Why did you choose your top pick?
          </label>
          <p style={{ fontSize: 12, color: "#c4b5fd", marginBottom: 10, fontWeight: 500 }}>Optional — but we'd love to hear your reasoning.</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your thoughts…"
            style={{
              width: "100%",
              borderRadius: 14,
              border: "1.5px solid #d8b4fe",
              background: "rgba(255,255,255,0.7)",
              padding: "12px 16px",
              fontSize: 14,
              color: "#1e293b",
              outline: "none",
              resize: "none" as const,
              lineHeight: 1.6,
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box" as const,
            }}
            onFocus={(e) => { e.target.style.borderColor = "#a78bfa"; e.target.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.12)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#d8b4fe"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* submit */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={submit}
            disabled={ranked.length < 3 || submitting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 52,
              padding: "0 36px",
              borderRadius: 100,
              background: ranked.length < 3
                ? "#d1d5db"
                : submitting
                ? "linear-gradient(135deg, #a5b4fc, #818cf8)"
                : "linear-gradient(135deg, #6366f1, #4f46e5, #7c3aed)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.5,
              border: "none",
              cursor: ranked.length < 3 || submitting ? "not-allowed" : "pointer",
              boxShadow: ranked.length >= 3 ? "0 4px 20px rgba(99,102,241,0.35), 0 2px 8px rgba(124,58,237,0.2)" : "none",
              transition: "transform 0.15s, box-shadow 0.15s",
              opacity: submitting ? 0.8 : 1,
            }}
            onMouseDown={(e) => { if (ranked.length >= 3 && !submitting) (e.target as HTMLElement).style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
          >
            {submitting ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8, animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Submitting…
              </>
            ) : (
              "Submit My Vote"
            )}
          </button>
          {submitError && (
            <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, fontWeight: 500 }}>
              {submitError}
            </p>
          )}
          <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 16, lineHeight: 1.5 }}>
            Voting closes on <span style={{ color: "#475569", fontWeight: 600 }}>Friday, March 20</span>.
            <br />
            Every vote counts.
          </p>
        </div>
      </main>

      {/* footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(165,180,252,0.3)",
          padding: "32px 24px",
          background: "linear-gradient(135deg, rgba(224,231,255,0.4), rgba(237,233,254,0.3))",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#a5b4fc", fontSize: 12, lineHeight: 1.6, marginBottom: 4, fontStyle: "italic" }}>
            At the desired time. In the optimal place. Through appropriate modalities. At no cost.
          </p>
          <p style={{ color: "#c7d2fe", fontSize: 11 }}>
            Advocate Health · Language Services · One Team, One Voice, One Mission
          </p>
        </div>
      </footer>
    </div>
  );
}
