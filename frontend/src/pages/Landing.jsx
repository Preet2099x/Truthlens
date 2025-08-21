
import React from "react";
import Navbar from "../components/Navbar";
import Hero3D from "../components/Hero3D";

export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero3D />

        <section style={{ padding: "40px 16px" }}>
          <div style={{ maxWidth:1120, margin:"0 auto" }}>
            <h2 style={{ fontSize:22, color:"#083344" }}>What you can check today</h2>
            <div style={{ display:"flex", gap:16, marginTop:16, flexWrap:"wrap" }}>
              <Feature title="Text fact-check" desc="Paste a headline or message to get a credibility score." emoji="📝" />
              <Feature title="URL scan" desc="Drop a link to scan for phishing and misinformation." emoji="🔗" />
              <Feature title="Voice input" desc="Record a short clip; we’ll transcribe and check the claim." emoji="🎙️" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function Feature({ title, desc, emoji }) {
  return (
    <div style={{ flex:"1 1 280px", borderRadius:12, background:"#ffffff", padding:18, boxShadow:"0 8px 20px rgba(2,6,23,0.06)" }}>
      <div style={{ fontSize:28 }}>{emoji}</div>
      <h3 style={{ marginTop:8 }}>{title}</h3>
      <p style={{ color:"#475569" }}>{desc}</p>
    </div>
  );
}

