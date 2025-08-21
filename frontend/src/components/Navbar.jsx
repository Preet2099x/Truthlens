
import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <span style={styles.logoDot} /> TruthLens
        </Link>

        <nav style={styles.nav}>
          <NavLink to="/" style={styles.navLink}>Home</NavLink>
          <NavLink to="/signin" style={styles.navLink}>Sign in</NavLink>
          <NavLink to="/signup" style={styles.navCTA}>Sign up</NavLink>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: { borderBottom: "1px solid #eee", background: "#fff", position: "sticky", top: 0, zIndex: 10 },
  container: { maxWidth: 1120, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700, textDecoration: "none", color: "#0f172a", fontSize: 20 },
  logoDot: { width: 10, height: 10, borderRadius: "50%", background: "#154d71", display: "inline-block" },
  nav: { display: "flex", gap: 12, alignItems: "center" },
  navLink: { textDecoration: "none", color: "#334155", padding: "8px 12px", borderRadius: 10 },
  navCTA: { textDecoration: "none", background: "#1c6ea4", color: "#fff", padding: "8px 14px", borderRadius: 12, fontWeight: 600 }
};

