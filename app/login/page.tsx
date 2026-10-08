"use client";

import toast from 'react-hot-toast';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slice/authSlice";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
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
        toast.error(data.message || "Login failed");
        return;
      }

      setLoading(false);
      
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Dispatch to Redux
      dispatch(login(data.user));

      toast.success("Login Successful!");

      const userRole = data.user.role;
      const redirectParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;

      if (userRole === "admin") {
        router.push("/admin");
      } else if (redirectParam) {
        router.push(redirectParam);
      } else {
        router.push("/user/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        {/* Left Column: Big Screen Entertainment Showcase */}
        <div className={styles.heroShowcase}>
          <span className={styles.heroEyebrow}>Your Ticket To</span>
          <h1 className={styles.heroTitle}>
            Big Screen
            <span className={styles.heroTitleAccent}>Entertainment</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Book your favorite movies, choose the best seats and enjoy a seamless cinema experience.
          </p>
          <div className={styles.heroLine}></div>
        </div>

        {/* Right Column: Cinematic Glowing Login Card */}
        <div className={styles.card}>
          <div className={styles.avatarSphere}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>

          <h2 className={styles.title}>Login</h2>
          <p className={styles.subtitle}>Welcome back! Please login to your account.</p>

          <form onSubmit={handleLogin} autoComplete="off" className={styles.form}>
            {/* Email Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.inputNoRightIcon}`}
                  required
                  autoComplete="new-email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className={styles.input}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              {loading ? "Verifying..." : "Login"}
            </button>

            {/* Divider */}
            <div className={styles.divider}>OR</div>

            {/* Footer */}
            <p className={styles.footer}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className={styles.link}>
                Create one <span>&rarr;</span>
              </Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
