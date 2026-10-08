"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import toast from "react-hot-toast";
import styles from "./movies.module.css";
import { defaultMoviesList, trailerMap, Movie, getMovieTrailer, getMoviePoster } from "@/data/movies";

const languages = ["All", "Tamil", "Malayalam", "Telugu", "Hindi"];
const genres = ["All", "Action", "Thriller", "Crime", "Comedy", "Sci-Fi", "Drama", "Adventure", "Romance", "Horror"];

const MoviesPage: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [movies, setMovies] = useState<Movie[]>(defaultMoviesList);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [selectedMovieTitle, setSelectedMovieTitle] = useState<string>("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/movies");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const active = data.filter((m: Movie) => !m.status || m.status === "Active");
            const merged = [...defaultMoviesList];
            active.forEach((bm: Movie) => {
              const key = bm.title?.trim().toLowerCase() || "";
              const idx = merged.findIndex(
                (m) => m.title?.trim().toLowerCase() === key || m.id === bm.id
              );
              const posterImage = getMoviePoster(bm);
              const trailerUrl = getMovieTrailer(bm);

              if (idx >= 0) {
                merged[idx] = {
                  ...merged[idx],
                  ...bm,
                  image: posterImage,
                  trailer: trailerUrl,
                };
              } else {
                merged.unshift({
                  ...bm,
                  image: posterImage,
                  trailer: trailerUrl,
                  language: bm.language || "Tamil",
                  rating: bm.rating || "8.0",
                });
              }
            });
            setMovies(merged);
          }
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };
    fetchMovies();
  }, []);

  const openTrailer = (movie: Movie) => {
    const trailer = getMovieTrailer(movie);

    if (trailer) {
      const embedUrl = trailer.includes("?")
        ? `${trailer}&autoplay=1`
        : `${trailer}?autoplay=1`;
      setSelectedTrailer(embedUrl);
      setSelectedMovieTitle(movie.title);
    } else {
      toast.error(`Trailer is not available for ${movie.title}`);
    }
  };

  const closeTrailer = () => {
    setSelectedTrailer(null);
    setSelectedMovieTitle("");
  };

  const filtered = movies.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.toLowerCase().includes(search.toLowerCase());
    const matchGenre = selectedGenre === "All" || m.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchLanguage =
      selectedLanguage === "All" ||
      (m.language && m.language.toLowerCase() === selectedLanguage.toLowerCase());
    return matchSearch && matchGenre && matchLanguage;
  });

  const user = useSelector((state: RootState) => state.auth.user);

  const handleBookNow = (movieId: number) => {
    let currentUser = user;
    if (!currentUser && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user");
        if (saved) currentUser = JSON.parse(saved);
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

  const handleQuickBook = (movieId: number) => {
    let currentUser = user;
    if (!currentUser && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user");
        if (saved) currentUser = JSON.parse(saved);
      } catch (e) {}
    }

    if (!currentUser) {
      toast.error("Please login to book tickets!");
      router.push(`/login?redirect=${encodeURIComponent(`/payment?movie=${movieId}&seats=A1,A2&date=2026-04-20&time=19:30`)}`);
      return;
    }

    if (currentUser.role === "admin") {
      toast.error("Admin accounts cannot book tickets. Please login as a customer.");
      router.push(`/login?redirect=${encodeURIComponent(`/payment?movie=${movieId}&seats=A1,A2&date=2026-04-20&time=19:30`)}`);
      return;
    }

    router.push(`/payment?movie=${movieId}&seats=A1,A2&date=2026-04-20&time=19:30`);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>🎬 Now Showing Movies</h1>
          <p className={styles.heroSubtitle}>
            Blockbuster cinema across Tamil, Malayalam, Telugu, and Hindi
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by movie title or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Language Filters */}
        <div className={styles.genreFilters} style={{ marginBottom: "10px" }}>
          {languages.map((lang) => (
            <button
              key={lang}
              className={`${styles.genreChip} ${selectedLanguage === lang ? styles.activeChip : ""}`}
              onClick={() => setSelectedLanguage(lang)}
              style={{
                borderColor: selectedLanguage === lang ? "#ff1a75" : "rgba(255, 255, 255, 0.15)",
                background: selectedLanguage === lang ? "#ff1a75" : "rgba(255, 255, 255, 0.05)",
              }}
            >
              {lang === "All" && "🌐 "}
              {lang === "Tamil" && "🎭 "}
              {lang === "Malayalam" && "🌴 "}
              {lang === "Telugu" && "⚡ "}
              {lang === "Hindi" && "🎬 "}
              {lang}
            </button>
          ))}
        </div>

        {/* Genre Filters */}
        <div className={styles.genreFilters}>
          {genres.map((g) => (
            <button
              key={g}
              className={`${styles.genreChip} ${selectedGenre === g ? styles.activeChip : ""}`}
              onClick={() => setSelectedGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div className={styles.moviesGrid}>
        {filtered.length === 0 ? (
          <div className={styles.noResults} style={{ textAlign: "center", gridColumn: "1 / -1", padding: "60px 20px" }}>
            <p style={{ fontSize: "1.3rem", color: "#eee" }}>No movies found matching your filters.</p>
            <p style={{ color: "#777", marginTop: "6px" }}>Try selecting another language or clear search.</p>
          </div>
        ) : (
          filtered.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.moviePoster}>
                <span className={styles.ratingBadge}>★ {movie.rating || "8.0"}</span>
                <img
                  src={movie.image || "/leo.jpg"}
                  alt={movie.title}
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/leo.jpg";
                  }}
                />
                <div className={styles.posterOverlay}>
                  <button
                    className={styles.quickBookBtn}
                    onClick={() => handleQuickBook(movie.id)}
                  >
                    Quick Book
                  </button>
                </div>
              </div>
              <div className={styles.movieInfo}>
                <h3 className={styles.movieTitle} title={movie.title}>{movie.title}</h3>
                <p className={styles.movieGenre}>{movie.genre}</p>
                <div className={styles.movieMeta}>
                  <span>⏱ {movie.duration || "150 min"}</span>
                  <span style={{ color: "#ff4d88", fontWeight: 700 }}>🌐 {movie.language || "Tamil"}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => openTrailer(movie)}
                    style={{
                      flex: 1,
                      padding: "9px 10px",
                      background: "rgba(255, 255, 255, 0.08)",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    ▶ Trailer
                  </button>
                  <button
                    className={styles.bookBtn}
                    style={{ flex: 1.2, margin: 0 }}
                    onClick={() => handleBookNow(movie.id)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===================================================
          TRAILER MODAL
          =================================================== */}
      {selectedTrailer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={closeTrailer}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "850px",
              backgroundColor: "#16161f",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 26, 117, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeTrailer}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "#ff1a75",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "1.2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                zIndex: 2,
                boxShadow: "0 0 15px rgba(255, 26, 117, 0.6)",
              }}
            >
              &times;
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px",
                paddingRight: "40px",
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  margin: 0,
                  fontSize: "1.35rem",
                  fontWeight: 700,
                }}
              >
                🎬 {selectedMovieTitle} - Official Trailer
              </h2>

              {selectedTrailer && (
                <a
                  href={selectedTrailer.replace("/embed/", "/watch?v=").split("?")[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ff0000",
                    color: "#ffffff",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    boxShadow: "0 2px 8px rgba(255, 0, 0, 0.4)",
                  }}
                >
                  ▶ Open in YouTube ↗
                </a>
              )}
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              <iframe
                src={selectedTrailer}
                title={`${selectedMovieTitle} Trailer`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
