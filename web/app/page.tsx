export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        background: "#0a0a0a",
        color: "#e5e5e5",
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0 }}>QUORUM</h1>
      <p style={{ color: "#888", fontSize: "1.1rem", margin: 0 }}>
        Multi-Agent Tribunal for Architectural Decisions
      </p>
      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem 2.5rem",
          border: "1px solid #333",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#f59e0b", fontWeight: 600, margin: 0 }}>
          Quorum Dashboard — Coming in Step 3
        </p>
        <p style={{ color: "#555", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          ADR viewer · Council session replay · Decision Confidence Score history
        </p>
      </div>
      <p style={{ color: "#444", fontSize: "0.75rem", marginTop: "2rem" }}>
        IBM Bob Hackathon 2026 · Built with Bob IDE
      </p>
    </main>
  );
}
