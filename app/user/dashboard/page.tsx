"use client";
import toast from 'react-hot-toast';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const mockMovies = [
  { id: 1, title: "Leo", genre: "Action / Thriller", image: "/leo.jpg", rating: "8.8" },
  { id: 2, title: "Jailer", genre: "Action / Comedy", image: "/jailer.jpg", rating: "7.9" },
  { id: 3, title: "Vikram", genre: "Action / Thriller", image: "/vikram.jpg", rating: "8.6" },
  { id: 4, title: "Maharaja", genre: "Crime / Thriller", image: "/maharaja.jpg", rating: "8.5" },
];

const upcomingMoviesList = [
  { id: 5, title: "Viduthalai Part 2", genre: "Crime / Drama", image: "/viduthalai.jpg" },
  { id: 6, title: "Coolie", genre: "Action / Thriller", image: "/coolie.png" },
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
          onClick={() => toast(`🎉 You have ${points} reward points!\n\nRedeem them on your next booking for discounts.`)}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statValue}>{points}</div>
          <div className={styles.statLabel}>Reward Points</div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className={styles.nowShowing}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Now Showing</h2>
          <Link href="/movies" className={styles.viewAll}>View All</Link>
        </div>
        
        <div className={styles.moviesCarousel}>
          {mockMovies.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.moviePoster}>
                <div className={styles.ratingBadge}>★ {movie.rating}</div>
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

      {/* Upcoming Movies Section */}
      <section id="upcoming-section" className={styles.upcomingSection} style={{ marginTop: "40px" }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Upcoming Movies</h2>
        </div>
        
        <div className={styles.moviesCarousel}>
          {upcomingMoviesList.map((movie) => (
            <div key={movie.id} className={styles.movieCard} style={{ opacity: 0.9 }}>
              <div className={styles.moviePoster}>
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