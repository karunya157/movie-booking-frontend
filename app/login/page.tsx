"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slice/authSlice";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        alert(data.message || "Login failed");
        return;
      }

      setLoading(false);
      
      // Dispatch to Redux
      dispatch(login(data.user));

      alert("Login Successful!");

      const userRole = data.user.role;
      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/user/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 160px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at center, #1a1a2e 0%, #0f0f0f 100%)",
      }}
    >
      <form
        onSubmit={handleLogin}
        className="fade-in"
        style={{
          background: "#161616",
          padding: "40px",
          borderRadius: "16px",
          width: "350px",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "2rem", fontWeight: "800" }}>
          Login
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#a0a0a0", fontSize: "0.9rem" }}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
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
          <label style={{ display: "block", marginBottom: "8px", color: "#a0a0a0", fontSize: "0.9rem" }}>Login as</label>
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
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "1rem"
          }}
        >
          {loading ? "Verifying..." : "Login"}
        </button>

        <p style={{ marginTop: "25px", textAlign: "center", color: "#a0a0a0", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <span
            style={{ color: "#e50914", cursor: "pointer", fontWeight: "600" }}
            onClick={() => router.push("/signup")}
          >
            Create one
          </span>
        </p>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "none",
};

