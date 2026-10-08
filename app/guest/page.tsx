"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import toast from "react-hot-toast";

interface GuestMovie {
  id: number;
  title: string;
  language?: string;
  genre: string;
  image: string;
  rating: string;
}

// Exactly 4 premier blockbuster movies as requested
const fourMoviesList: GuestMovie[] = [
  { id: 2, title: "Leo", language: "Tamil", genre: "Action / Thriller", image: "/leo.jpg", rating: "8.2" },
  { id: 3, title: "Jailer", language: "Tamil", genre: "Action / Comedy", image: "/jailer.jpg", rating: "7.9" },
  { id: 4, title: "Vikram", language: "Tamil", genre: "Action / Thriller", image: "/vikram.jpg", rating: "8.6" },
  { id: 5, title: "Maharaja", language: "Tamil", genre: "Crime / Thriller", image: "/maharaja.jpg", rating: "8.5" },
];

const BrowseMovies = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const [movieList, setMovieList] = useState<GuestMovie[]>(fourMoviesList);
  const [selectedGenre, setSelectedGenre] = useState("All");

  const handleBookTickets = (movieId: number) => {
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let currentUser = user;
    if (!currentUser && savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
      } catch (e) {}
    }
    if (!currentUser) {
      toast.error("Please login to book tickets!");
      router.push(`/login?redirect=${encodeURIComponent(`/book?movie=${movieId}`)}`);
      return;
    }
    if (currentUser.role === "admin") {
      toast.error("Admin accounts cannot book tickets. Please login as a customer.");
      router.push(`/login?redirect=${encodeURIComponent(`/book?movie=${movieId}`)}`);
      return;
    }
    router.push(`/book?movie=${movieId}`);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/movies");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const active = data.filter((m: any) => !m.status || m.status === "Active");
            // Prefer the 4 requested movies, or take top 4
            const targetTitles = ["Leo", "Jailer", "Vikram", "Maharaja"];
            const matched = active.filter((m: any) => targetTitles.some(t => t.toLowerCase() === m.title?.toLowerCase()));
            if (matched.length === 4) {
              setMovieList(matched);
            } else if (active.length > 0) {
              setMovieList(active.slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error("Guest page fetch movies error:", err);
      }
    };
    fetchMovies();
  }, []);

  const filteredMovies = movieList.filter((m) => {
    if (selectedGenre === "All") return true;
    return m.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
  });

  return (
    <main style={{ padding: "60px 40px", background: "#0a0a0a", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "10px", color: "#fff", fontWeight: 800 }}>Now Showing</h1>
            <p style={{ color: "#a0a0a0", fontSize: "1rem" }}>Check out the latest releases and pick your showtime.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{ 
                width: "auto", 
                margin: 0, 
                padding: "10px 18px", 
                background: "#161616", 
                color: "#fff", 
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "0.95rem"
              }}
            >
              <option value="All">All Genres</option>
              <option value="Action">Action</option>
              <option value="Crime">Crime</option>
              <option value="Thriller">Thriller</option>
              <option value="Comedy">Comedy</option>
            </select>
          </div>
        </div>

        {/* Clean 4-column responsive grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
          gap: "32px",
          maxWidth: "1280px"
        }}>
          {filteredMovies.map((movie) => (
            <div key={movie.id} style={movieCardStyle}>
              <div style={imageWrapperStyle}>
                <img
                  src={movie.image || "/leo.jpg"}
                  alt={movie.title}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/leo.jpg"; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                />
                <div style={ratingBadgeStyle}>★ {movie.rating || "8.0"}</div>
              </div>
              <div style={{ padding: "20px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {movie.title}
                </h3>
                <p style={{ color: "#a0a0a0", fontSize: "0.9rem", marginBottom: "20px" }}>
                  {movie.language || "Tamil"} • {movie.genre}
                </p>
                <button 
                  type="button"
                  onClick={() => handleBookTickets(movie.id)}
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    background: "linear-gradient(135deg, #ff1a75, #ff4d88)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(255, 26, 117, 0.3)"
                  }}
                >
                  Book Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

const movieCardStyle: React.CSSProperties = {
  background: "#161616",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  transition: "all 0.3s ease",
};

const imageWrapperStyle: React.CSSProperties = {
  position: "relative",
  aspectRatio: "2/3",
  overflow: "hidden",
  background: "#0f172a",
};

const ratingBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: "15px",
  right: "15px",
  background: "rgba(0,0,0,0.8)",
  backdropFilter: "blur(10px)",
  padding: "5px 12px",
  borderRadius: "20px",
  color: "#ffcc00",
  fontWeight: "700",
  fontSize: "0.85rem",
  border: "1px solid rgba(255,255,255,0.1)"
};

export default BrowseMovies;