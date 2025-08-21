
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";

function FloatingCard() {
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh scale={[1.6,1,0.12]}>
        <boxGeometry args={[3, 1.6, 0.15]} />
        <meshStandardMaterial color={"#ffffff"} roughness={0.35} metalness={0.1} />
        <Html center>
          <div style={{
            width: 380,
            padding: 18,
            borderRadius: 14,
            background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,252,255,0.9))",
            boxShadow: "0 8px 30px rgba(12,20,40,0.15)"
          }}>
            <h2 style={{ margin:0, color: "#154d71", fontSize: 20, fontWeight: 800 }}>
              See the truth behind every link.
            </h2>
            <p style={{ marginTop:8, color:"#083344", fontSize:14 }}>
              Paste a link, text or upload a voice clip to instantly check credibility.
            </p>
            <div style={{ marginTop:12, display: "flex", gap: 8 }}>
              <a href="/signup" style={{ padding:"8px 12px", background:"#33a1e0", color:"#042236", borderRadius:10, fontWeight:700, textDecoration:"none" }}>Get started</a>
            </div>
          </div>
        </Html>
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <section style={{ height: 420, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#154d71,#1c6ea4)" }}>
      <div style={{ width: "95%", maxWidth: 1100, display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ flex:1, color:"#fff" }}>
          <h1 style={{ fontSize: 36, margin:0, lineHeight:1.05 }}>See the truth behind every link, post, and message.</h1>
          <p style={{ marginTop:14, color:"rgba(255,255,255,0.95)", maxWidth:520 }}>
            TruthLens helps you verify news, flag scams, and spot manipulated media in seconds.
          </p>
        </div>

        <div style={{ width: 480, height: 320, borderRadius: 20, overflow:"hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
          <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Suspense fallback={null}>
              <FloatingCard />
            </Suspense>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.6} />
          </Canvas>
        </div>
      </div>
    </section>
  );
}

