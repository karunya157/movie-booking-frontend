"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const mockMovies = [
  { id: 1, title: "Dune: Part Two", genre: "Sci-Fi / Adventure", image: "/dune.png", rating: "8.8" },
  { id: 2, title: "Godzilla x Kong", genre: "Action / Sci-Fi", image: "/godzilla.png", rating: "7.1" },
  { id: 3, title: "Kung Fu Panda 4", genre: "Animation / Family", image: "/kungfu.png", rating: "6.9" },
  { id: 4, title: "Civil War", genre: "Action / Thriller", image: "/civilwar.png", rating: "7.5" },
];

const upcomingMoviesList = [
  { id: 5, title: "Deadpool & Wolverine", genre: "Action / Comedy", image: "/deadpool.png", releaseDate: "July 26" },
  { id: 6, title: "Despicable Me 4", genre: "Animation / Comedy", image: "/despicable.png", releaseDate: "July 3" },
];

const UserDashboard: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Real stats (fetched or derived)
  const [ticketsBooked, setTicketsBooked] = useState(0);
  const [upcoming] = useState(upcomingMoviesList.length);
  const [points] = useState(350);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/bookings?userId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setTicketsBooked(data.length);
        }
      } catch (error) {
        console.error("Fetch Stats Error:", error);
      }
    };
    fetchStats();
  }, [user]);

  const handleBookNow = (movieId: number) => {
    router.push(`/user/bookings?movie=${movieId}`);
  };

  if (!user) {
    return (
      <div className={styles.dashboardWrapper} style={{ color: "white", textAlign: "center", padding: "100px" }}>
        <h2>Loading Dashboard...</h2>
        <p>Please wait while we set things up for you.</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>

      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h1>Welcome back, {user.name}!</h1>
          <p>Ready for your next cinematic adventure?</p>
        </div>
        <div className={styles.quickActions}>
          <Link href="/user/profile">
            <button className={styles.secondaryBtn}>Manage Profile</button>
          </Link>
          <Link href="/user/bookings">
            <button className={styles.primaryBtn}>My Bookings</button>
          </Link>
        </div>
      </header>

      
      <section className={styles.statsGrid}>
        <div
          className={`${styles.statCard} ${styles.clickable}`}
          onClick={() => router.push("/user/bookings")}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statValue}>{ticketsBooked}</div>
          <div className={styles.statLabel}>Tickets Booked</div>
        </div>
        <div
          className={`${styles.statCard} ${styles.clickable}`}
          onClick={() => {
            const upcomingSection = document.getElementById("upcoming-section");
            if (upcomingSection) upcomingSection.scrollIntoView({ behavior: "smooth" });
          }}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statValue}>{upcoming}</div>
          <div className={styles.statLabel}>Upcoming Movies</div>
        </div>
        <div
          className={`${styles.statCard} ${styles.clickable}`}
          onClick={() => alert(`🎉 You have ${points} reward points!\n\nRedeem them on your next booking for discounts.`)}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statValue}>{points}</div>
          <div className={styles.statLabel}>Reward Points</div>
        </div>
      </section>

      
      <section className={styles.nowShowing}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Now Showing</h2>
          <Link href="/movies" className={styles.viewAll}>View All</Link>
        </div>
        
        <div className={styles.moviesCarousel}>
          {mockMovies.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.moviePoster}>
                <div className={styles.ratingBadge}>
                  ★ {movie.rating}
                </div>
                {/* Fallback to background color if image isn't loaded */}
                <img src={movie.image} alt={movie.title} loading="lazy" />
              </div>
              <div className={styles.movieInfo}>
                <h3 className={styles.movieTitle} title={movie.title}>{movie.title}</h3>
                <p className={styles.movieGenre}>{movie.genre}</p>
                <button
                  className={styles.bookOutlineBtn}
                  onClick={() => handleBookNow(movie.id)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="upcoming-section" className={styles.nowShowing} style={{ marginTop: "40px" }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Upcoming Movies</h2>
        </div>
        
        <div className={styles.moviesCarousel}>
          {upcomingMoviesList.map((movie) => (
            <div key={movie.id} className={styles.movieCard} style={{ opacity: 0.9 }}>
              <div className={styles.moviePoster}>
                <div className={styles.ratingBadge} style={{ background: "rgba(255, 100, 100, 0.8)", color: "white" }}>
                  🗓 {movie.releaseDate}
                </div>
                <img src={movie.image} alt={movie.title} loading="lazy" />
              </div>
              <div className={styles.movieInfo}>
                <h3 className={styles.movieTitle} title={movie.title}>{movie.title}</h3>
                <p className={styles.movieGenre}>{movie.genre}</p>
                <button
                  className={styles.bookOutlineBtn}
                  disabled
                  style={{ opacity: 0.5, cursor: "not-allowed", border: "1px solid #444", color: "#888" }}
                >
                  Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;