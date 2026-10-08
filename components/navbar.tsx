"use client";

import React from "react";
import Link from "next/link";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/slice/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Navbar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/" style={{ textDecoration: "none" }}>
          <h2>🎬 MovieTicket</h2>
        </Link>
      </div>
      <div className="nav-links" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>Home</Link>
        <Link href="/movies" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>Movies</Link>
        {user ? (
          <>
            {user.role === "admin" ? (
              <Link href="/admin" style={{ color: "#f59e0b", textDecoration: "none", fontWeight: "bold" }}>Admin Dashboard</Link>
            ) : (
              <>
                <Link href="/user/bookings" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>My Bookings</Link>
                <Link href="/user/profile" style={{ color: "#fff", textDecoration: "none", fontWeight: "500" }}>Profile</Link>
              </>
            )}
            <span style={{ color: "#e50914", fontWeight: "bold" }}>
              Hi, {user.name} {user.role === "admin" ? "(Admin)" : ""}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 14px",
                fontSize: "0.85rem",
                background: "#e50914",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Logout
            </button>
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