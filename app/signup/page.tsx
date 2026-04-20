"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setError("");
    setSuccess("");
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 160px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at center, #1a1a2e 0%, #0f0f0f 100%)",
        padding: "40px 20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="fade-in"
        style={{
          background: "#161616",
          padding: "40px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "380px",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "8px", fontSize: "2rem", fontWeight: "800" }}>
          Create Account
        </h2>
        <p style={{ textAlign: "center", color: "#a0a0a0", fontSize: "0.9rem", marginBottom: "30px" }}>
          Join MovieTicket and book your seats today
        </p>

        {error && (
          <div style={{
            background: "rgba(229,9,20,0.15)",
            border: "1px solid rgba(229,9,20,0.4)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#ff6b6b",
            fontSize: "0.9rem",
          }}>
            ⚠ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#6ee7b7",
            fontSize: "0.9rem",
          }}>
            ✓ {success}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#a0a0a0", fontSize: "0.9rem" }}>Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            required
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#a0a0a0", fontSize: "0.9rem" }}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange}
            required
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#a0a0a0", fontSize: "0.9rem" }}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#a0a0a0", fontSize: "0.9rem" }}>Join as</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ marginBottom: 0 }}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "14px", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p style={{ marginTop: "25px", textAlign: "center", color: "#a0a0a0", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#e50914", cursor: "pointer", fontWeight: "600" }}
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
