"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#111",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
        🎬 Welcome to Movie Booking App
      </h1>

      <p style={{ marginBottom: "30px" }}>
        Book your favorite movies بسهولة!
      </p>

      <div style={{ display: "flex", gap: "20px" }}>
        <button
          onClick={() => router.push("/login")}
          style={{
            padding: "10px 20px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        <button
          onClick={() => router.push("/guest")}
          style={{
            padding: "10px 20px",
            background: "gray",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}