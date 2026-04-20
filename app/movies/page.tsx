"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./movies.module.css";

const allMovies = [
  { id: 1, title: "Dune: Part Two", genre: "Sci-Fi / Adventure", image: "/dune.png", rating: "8.8", duration: "166 min", language: "English" },
  { id: 2, title: "Godzilla x Kong", genre: "Action / Sci-Fi", image: "/godzilla.png", rating: "7.1", duration: "115 min", language: "English" },
  { id: 3, title: "Kung Fu Panda 4", genre: "Animation / Family", image: "/kungfu.png", rating: "6.9", duration: "94 min", language: "English" },
  { id: 4, title: "Civil War", genre: "Action / Thriller", image: "/civilwar.png", rating: "7.5", duration: "109 min", language: "English" },
  { id: 5, title: "The Batman", genre: "Action / Crime", image: "/batman.jpg", rating: "7.8", duration: "176 min", language: "English" },
  { id: 6, title: "Oppenheimer", genre: "Drama / History", image: "/oppenheimer.jpg", rating: "8.5", duration: "180 min", language: "English" },
  { id: 7, title: "Avatar: The Way of Water", genre: "Sci-Fi / Fantasy", image: "/avatar.jpg", rating: "7.6", duration: "192 min", language: "English" },
  { id: 8, title: "Top Gun: Maverick", genre: "Action / Drama", image: "/topgun.jpg", rating: "8.3", duration: "130 min", language: "English" },
];

const genres = ["All", "Action", "Sci-Fi", "Animation", "Drama", "Thriller", "Fantasy", "Crime"];

const MoviesPage: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filtered = allMovies.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = selectedGenre === "All" || m.genre.includes(selectedGenre);
    return matchSearch && matchGenre;
  });

  const handleBookNow = (movieId: number) => {
    router.push(`/book?movie=${movieId}`);
  };

  const handleQuickBook = (movieId: number) => {
    router.push(`/payment?movie=${movieId}&seats=A1,A2&date=2026-04-20&time=19:30`);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>🎬 Now Showing</h1>
          <p className={styles.heroSubtitle}>Book your seats for the latest blockbusters</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
          <div className={styles.noResults}>
            <p>No movies found matching your search.</p>
          </div>
        ) : (
          filtered.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.moviePoster}>
                <span className={styles.ratingBadge}>★ {movie.rating}</span>
                <img src={movie.image} alt={movie.title} loading="lazy" />
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
                  <span>⏱ {movie.duration}</span>
                  <span>🌐 {movie.language}</span>
                </div>
                <button
                  className={styles.bookBtn}
                  onClick={() => handleBookNow(movie.id)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
