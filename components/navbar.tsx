"use client";

import React from "react";
import Link from "next/link";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Navbar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/" style={{ textDecoration: "none" }}>
          <h2>🎬 MovieTicket</h2>
        </Link>
      </div>
      <div className="nav-links" style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>Home</Link>
        <Link href="/guest" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>Movies</Link>
        {user ? (
          <>
            <Link href="/user/bookings" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>My Bookings</Link>
            <Link href="/user/profile" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>Profile</Link>
            <span style={{ color: "#e50914", fontWeight: "bold" }}>Hi, {user.name}</span>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>Login</Link>
            <Link href="/signup">
              <button style={{ padding: "8px 20px", fontSize: "0.9rem" }}>Get Started</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;