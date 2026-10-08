"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import toast from "react-hot-toast";
import styles from "./home.module.css";
import { defaultMoviesList, trailerMap, Movie, getMovieTrailer, getMoviePoster } from "@/data/movies";

const languages = ["All", "Tamil", "Malayalam", "Telugu", "Hindi"];

const Home: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const [movies, setMovies] = useState<Movie[]>(defaultMoviesList);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [selectedMovieTitle, setSelectedMovieTitle] = useState<string>("");

  const handleBookTickets = (movieId: number) => {
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

  /* =======================================================
     FETCH & MERGE MOVIES FROM API
     ======================================================= */
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/movies");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const activeMovies = data.filter(
              (m: Movie) => m.status === "Active" || !m.status
            );

            // Merge dynamic movies from backend with our default catalogue
            const merged = [...defaultMoviesList];
            activeMovies.forEach((bm: Movie) => {
              const key = bm.title?.trim().toLowerCase() || "";
              const idx = merged.findIndex(
                (m) => m.title?.trim().toLowerCase() === key || m.id === bm.id
              );
              const trailerUrl = getMovieTrailer(bm);
              const posterImage = getMoviePoster(bm);

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
        console.error("Failed to fetch movies from backend:", error);
      }
    };

    fetchMovies();
  }, []);

  /* =======================================================
     TRAILER MODAL
     ======================================================= */
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

  /* Filter movies by selected language */
  const filteredMovies = movies.filter((movie) => {
    if (selectedLanguage === "All") return true;
    return movie.language?.toLowerCase() === selectedLanguage.toLowerCase();
  });

  return (
    <div className={styles.pageWrapper}>
      
      {/* ===================================================
          1. HERO SECTION
          =================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgePulse}></span>
            <span>⚡ MULTI-LANGUAGE CINEMA BLOCKBUSTERS</span>
          </div>

          <h1 className={styles.heroTitle}>
            Experience Cinema Across <span className={styles.titleGradient}>Tamil, Malayalam, Telugu &amp; Hindi</span>
          </h1>

          <p className={styles.heroDescription}>
            Book premium Dolby Atmos and IMAX tickets for the biggest superstars across South India and Bollywood. Live seat selection, gourmet snacks, and hassle-free instant refunds.
          </p>

          <div className={styles.heroActions}>
            <Link href="#now-showing" className={styles.btnPrimary}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Explore Now Showing
            </Link>

            <Link href="/guest" className={styles.btnSecondary}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="6" cy="12" r="1"></circle>
                <circle cx="18" cy="12" r="1"></circle>
              </svg>
              Browse Theatres
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================
          2. NOW SHOWING SECTION WITH LANGUAGE FILTERS
          =================================================== */}
      <section id="now-showing" className={styles.nowShowingSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTitleRow}>
              <span className={styles.sectionIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <line x1="2" y1="7" x2="7" y2="7"></line>
                  <line x1="2" y1="17" x2="7" y2="17"></line>
                  <line x1="17" y1="17" x2="22" y2="17"></line>
                  <line x1="17" y1="7" x2="22" y2="7"></line>
                </svg>
              </span>
              <h2 className={styles.sectionTitle}>
                Now <span className={styles.titlePink}>Showing</span>
              </h2>
            </div>
            <p className={styles.sectionSubtitle}>
              Explore blockbusters streaming in theaters across your favorite languages
            </p>
          </div>

          <Link href="/guest" className={styles.viewAllLink}>
            View Featured Movies &rarr;
          </Link>
        </div>

        {/* Language Filter Tabs */}
        <div className={styles.languageFilterBar}>
          {languages.map((lang) => {
            const count =
              lang === "All"
                ? movies.length
                : movies.filter((m) => m.language?.toLowerCase() === lang.toLowerCase()).length;

            return (
              <button
                key={lang}
                className={`${styles.languageTab} ${
                  selectedLanguage === lang ? styles.activeLanguageTab : ""
                }`}
                onClick={() => setSelectedLanguage(lang)}
              >
                <span>
                  {lang === "All" && "🌐 "}
                  {lang === "Tamil" && "🎭 "}
                  {lang === "Malayalam" && "🌴 "}
                  {lang === "Telugu" && "⚡ "}
                  {lang === "Hindi" && "🎬 "}
                  {lang}
                </span>
                <span className={styles.languageCount}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Movie Cards Grid */}
        <div className={styles.moviesGrid}>
          {filteredMovies.length === 0 ? (
            <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "60px 20px", color: "#888" }}>
              <p style={{ fontSize: "1.4rem", color: "#eee", marginBottom: "8px" }}>🎬 No movies found in {selectedLanguage}</p>
              <p style={{ fontSize: "0.95rem", color: "#777" }}>Try selecting &quot;All&quot; or another language above.</p>
            </div>
          ) : (
            filteredMovies.map((movie) => (
              <div key={movie.id} className={styles.movieCard}>
                <div className={styles.imageWrapper}>
                  <img
                    src={movie.image || "/leo.jpg"}
                    alt={movie.title}
                    className={styles.posterImage}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/leo.jpg";
                    }}
                  />
                  <div className={styles.ratingBadge}>
                    ★ {movie.rating || "8.0"}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{movie.title}</h3>
                  <div className={styles.cardMeta}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                      <line x1="7" y1="2" x2="7" y2="22"></line>
                      <line x1="17" y1="2" x2="17" y2="22"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                    </svg>
                    <span>{movie.genre}</span>
                    <span>•</span>
                    <span style={{ color: "#ff4d88", fontWeight: 700 }}>{movie.language || "Tamil"}</span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      onClick={() => openTrailer(movie)}
                      className={styles.btnTrailer}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Watch Trailer
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBookTickets(movie.id)}
                      className={styles.btnBook}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                        <circle cx="6" cy="12" r="1"></circle>
                        <circle cx="18" cy="12" r="1"></circle>
                      </svg>
                      Book Tickets
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ===================================================
          3. WHY CHOOSE US SECTION
          =================================================== */}
      <section className={styles.whyChooseSection}>
        <div className={styles.whyEyebrow}>Why Choose Us</div>
        <h2 className={styles.whyTitle}>
          The Ultimate Cinema <span className={styles.titlePink}>Experience</span>
        </h2>
        <p className={styles.whySubtitle}>
          Everything you need for the smoothest movie night in your favorite language
        </p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Tamil, Malayalam, Telugu &amp; Hindi</h3>
            <p className={styles.featureDesc}>
              Instant access to top multilingual blockbusters, regional cinema celebrations, and pan-Indian sensations.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="6" cy="12" r="1"></circle>
                <circle cx="18" cy="12" r="1"></circle>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Food &amp; Snacks Pre-ordering</h3>
            <p className={styles.featureDesc}>
              Order caramel popcorn, nachos, crispy samosas, and chilled beverages delivered straight to your cinema seat.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>100% Refund Guarantee</h3>
            <p className={styles.featureDesc}>
              Cancel anytime with a single click and receive a full, itemized refund covering both seats and pre-ordered snacks.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          4. FOOTER
          =================================================== */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <Link href="/" className={styles.footerLogo}>
            <span style={{ color: "#ff1a75" }}>🎬</span> TicketShow Cinema
          </Link>

          <p className={styles.footerCopy}>
            &copy; {new Date().getFullYear()} TicketShow. All rights reserved. Multilingual Movie Booking Platform.
          </p>

          <div className={styles.footerSocials}>
            <span className={styles.socialIcon}>Tamil</span>
            <span className={styles.socialIcon}>Malayalam</span>
            <span className={styles.socialIcon}>Telugu</span>
            <span className={styles.socialIcon}>Hindi</span>
          </div>
        </div>
      </footer>

      {/* ===================================================
          5. TRAILER MODAL
          =================================================== */}
      {selectedTrailer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
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
              backgroundColor: "#0d1421",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255, 26, 117, 0.4)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 26, 117, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeTrailer}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
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

export default Home;