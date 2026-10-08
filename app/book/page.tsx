"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import toast from "react-hot-toast";
import styles from "./book.module.css";
import { defaultMoviesList, Movie } from "@/data/movies";

/* ===== Mock Data for Cities and Theatres ===== */
const locationsData: Record<string, { name: string; amenities: string[]; timings: string[] }[]> = {
  "Chennai": [
    { name: "PVR: Sathyam Cinemas, Royapettah", amenities: ["IMAX", "Dolby Atmos", "Food"], timings: ["10:30 AM", "01:15 PM", "04:45 PM", "07:30 PM", "10:00 PM"] },
    { name: "INOX: Luxe, Phoenix Marketcity", amenities: ["4DX", "Dolby Atmos"], timings: ["11:00 AM", "02:30 PM", "06:00 PM", "09:15 PM"] },
    { name: "AGS Cinemas, T Nagar", amenities: ["Dolby 7.1", "Parking"], timings: ["01:00 PM", "05:15 PM", "08:30 PM"] }
  ],
  "Coimbatore": [
    { name: "KG Cinemas, Race Course", amenities: ["Dolby Atmos", "Recliners"], timings: ["10:15 AM", "01:30 PM", "04:20 PM", "08:15 PM"] },
    { name: "INOX: Prozone Mall", amenities: ["Dolby Cinema"], timings: ["12:00 PM", "03:45 PM", "07:00 PM", "10:30 PM"] },
    { name: "Sathyam Cinemas: Brookefields", amenities: ["Dolby Vision", "Atmos"], timings: ["10:00 AM", "02:00 PM", "06:00 PM", "09:30 PM"] }
  ],
  "Madurai": [
    { name: "INOX: Vishaal de Mal", amenities: ["Food", "Dolby 7.1"], timings: ["11:45 AM", "03:00 PM", "06:30 PM", "09:45 PM"] },
    { name: "Milan'em Mall Cinemas", amenities: ["Dolby Atmos", "VIP Lounge"], timings: ["12:30 PM", "04:00 PM", "08:00 PM"] }
  ],
  "Trichy": [
    { name: "LA Cinemas", amenities: ["Dolby Atmos", "Recliners"], timings: ["11:15 AM", "02:45 PM", "06:15 PM", "09:45 PM"] },
    { name: "Rambha Theatre", amenities: ["Dolby Atmos", "Food"], timings: ["12:45 PM", "04:30 PM", "08:15 PM"] }
  ],
  "Salem": [
    { name: "ARRS Multiplex, Meyyanur", amenities: ["Dolby Atmos", "4K Projection", "Food"], timings: ["10:15 AM", "01:30 PM", "04:45 PM", "07:30 PM", "10:15 PM"] },
    { name: "INOX: Reliance Mall, Salem", amenities: ["Dolby Atmos", "Recliners", "Food"], timings: ["11:00 AM", "02:15 PM", "06:00 PM", "09:30 PM"] },
    { name: "Kalyani Cinemas, 4 Roads", amenities: ["Dolby 7.1", "Parking"], timings: ["10:30 AM", "02:00 PM", "06:15 PM", "09:45 PM"] },
    { name: "Sapna Multiplex, Meyyanur", amenities: ["Dolby Atmos", "Recliners"], timings: ["11:30 AM", "03:00 PM", "06:45 PM", "10:00 PM"] }
  ]
};

/* Helper for dates */
const getNextDays = (numDays: number) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < numDays; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push({
      dateObj: nextDate,
      dayName: i === 0 ? "TODAY" : i === 1 ? "TOMORROW" : nextDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      day: nextDate.getDate(),
      month: nextDate.toLocaleDateString('en-US', { month: 'short' }),
      fullDateStr: nextDate.toISOString().split('T')[0] // YYYY-MM-DD
    });
  }
  return dates;
};

function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const movieId = Number(searchParams.get("movie") || 2);
  
  // Find movie immediately from central list so no fallback to wrong movie occurs
  const initialMovie = defaultMoviesList.find((m) => m.id === movieId) || defaultMoviesList[0];
  const [movie, setMovie] = useState<Movie>(initialMovie);

  // Authentication validation helper: Requires logged in customer
  const checkCustomerAuth = () => {
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
      return false;
    }

    if (currentUser.role === "admin") {
      toast.error("Admin accounts cannot book tickets. Please login as a customer.");
      router.push(`/login?redirect=${encodeURIComponent(`/book?movie=${movieId}`)}`);
      return false;
    }

    return true;
  };

  useEffect(() => {
    checkCustomerAuth();
  }, [user, movieId]);

  useEffect(() => {
    // Immediately select matched movie from default catalogue
    const matched = defaultMoviesList.find((m) => m.id === movieId);
    if (matched) {
      setMovie(matched);
    }

    const fetchMovie = async () => {
      try {
        const res = await fetch("/api/movies");
        if (res.ok) {
          const movies = await res.json();
          const found = movies.find((m: Movie) => m.id === movieId || m.title?.trim().toLowerCase() === matched?.title?.trim().toLowerCase());
          if (found) {
            setMovie(found);
          }
        }
      } catch (error) {
        console.error("Failed to fetch movie data:", error);
      }
    };
    fetchMovie();
  }, [movieId]);
  
  const [selectedCity, setSelectedCity] = useState("Chennai");
  const [activeFilter, setActiveFilter] = useState("All");
  
  const dates = getNextDays(5);
  const [selectedDateStr, setSelectedDateStr] = useState(dates[0].fullDateStr);

  const theatres = locationsData[selectedCity] || [];

  const handleTimeClick = (theatreName: string, time: string) => {
    if (!checkCustomerAuth()) return;
    
    // Navigate to Seat Selection with the exact active movie
    const activeMovieId = movie?.id || movieId;
    router.push(`/seats?movie=${activeMovieId}&theatre=${encodeURIComponent(theatreName)}&date=${selectedDateStr}&time=${encodeURIComponent(time)}`);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Header - Movie Info */}
        {!movie ? (
          <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>Loading movie details...</div>
        ) : (
          <div className={styles.headerSection}>
            <img 
              src={movie.image || "/leo.jpg"} 
              alt={movie.title} 
              className={styles.moviePoster}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/leo.jpg"; }}
            />
            <div className={styles.movieInfo}>
              <h1>{movie.title}</h1>
              <div className={styles.movieMeta}>
                <span className={styles.ratingBadge}>⭐ {movie.rating || "8.0"}</span>
                <span>•</span>
                <span>🎭 {movie.genre}</span>
                <span>•</span>
                <span style={{ color: "#ff1a75", fontWeight: 700 }}>🌐 {movie.language || "Tamil"}</span>
                <span>•</span>
                <span>⏱ {movie.duration || "150 min"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div className={styles.dateSection}>
          <h3 className={styles.sectionTitle}>Select Date</h3>
          <div className={styles.dateList}>
            {dates.map((d) => (
              <div 
                key={d.fullDateStr}
                className={`${styles.dateCard} ${selectedDateStr === d.fullDateStr ? styles.selectedDate : ''}`}
                onClick={() => setSelectedDateStr(d.fullDateStr)}
              >
                <span className={styles.dateMonth}>{d.month}</span>
                <span className={styles.dateDay}>{d.day}</span>
                <span className={styles.dateName}>{d.dayName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Layout (City Selector + Filters) */}
        <div className={styles.controlsLayout}>
          <div className={styles.citySelector}>
            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>City</span>
            <select 
              className={styles.citySelect}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {Object.keys(locationsData).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterChips}>
            {["All", "IMAX", "Dolby Atmos", "4DX"].map(filter => (
              <button 
                key={filter}
                className={`${styles.chip} ${activeFilter === filter ? styles.activeChip : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Theatres List */}
        <div className={styles.theatresList}>
          {theatres.filter(t => activeFilter === "All" || t.amenities.includes(activeFilter)).map((theatre, idx) => (
            <div key={idx} className={styles.theatreCard}>
              <div className={styles.theatreHeader}>
                <div className={styles.theatreInfo}>
                  <h3>{theatre.name} <span className={styles.infoIcon}>ⓘ</span></h3>
                  <div className={styles.theatreAmenities}>
                    {theatre.amenities.map((amenity, i) => (
                      <span key={i}>✓ {amenity}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={styles.timingsGrid}>
                {theatre.timings.map((time, i) => (
                  <button 
                    key={i} 
                    className={styles.timePill}
                    onClick={() => handleTimeClick(theatre.name, time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          {theatres.filter(t => activeFilter === "All" || t.amenities.includes(activeFilter)).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p>No theatres found matching your criteria in {selectedCity}.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading Theatres...</div>}>
      <BookPageContent />
    </Suspense>
  );
}
