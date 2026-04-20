"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./book.module.css";

/* ===== Movie data (mirrors movies page) ===== */
const allMovies: Record<number, { title: string; image: string; genre: string; duration: string; language: string; rating: string }> = {
  1: { title: "Dune: Part Two", image: "/dune.png", genre: "Sci-Fi / Adventure", duration: "166 min", language: "English", rating: "8.8" },
  2: { title: "Godzilla x Kong", image: "/godzilla.png", genre: "Action / Sci-Fi", duration: "115 min", language: "English", rating: "7.1" },
  3: { title: "Kung Fu Panda 4", image: "/kungfu.png", genre: "Animation / Family", duration: "94 min", language: "English", rating: "6.9" },
  4: { title: "Civil War", image: "/civilwar.png", genre: "Action / Thriller", duration: "109 min", language: "English", rating: "7.5" },
  5: { title: "The Batman", image: "/batman.jpg", genre: "Action / Crime", duration: "176 min", language: "English", rating: "7.8" },
  6: { title: "Oppenheimer", image: "/oppenheimer.jpg", genre: "Drama / History", duration: "180 min", language: "English", rating: "8.5" },
  7: { title: "Avatar: The Way of Water", image: "/avatar.jpg", genre: "Sci-Fi / Fantasy", duration: "192 min", language: "English", rating: "7.6" },
  8: { title: "Top Gun: Maverick", image: "/topgun.jpg", genre: "Action / Drama", duration: "130 min", language: "English", rating: "8.3" },
};

/* ===== Mock Data for Cities and Theatres ===== */
const locationsData: Record<string, { name: string; amenities: string[]; timings: string[] }[]> = {
  "New York": [
    { name: "AMC Empire 25", amenities: ["IMAX", "Dolby Atmos", "Food"], timings: ["10:30 AM", "01:15 PM", "04:45 PM", "07:30 PM", "10:00 PM"] },
    { name: "Regal Union Square", amenities: ["4DX", "Dolby Atmos"], timings: ["11:00 AM", "02:30 PM", "06:00 PM", "09:15 PM"] },
    { name: "Alamo Drafthouse", amenities: ["Dine-In", "Dolby 7.1"], timings: ["01:00 PM", "05:15 PM", "08:30 PM"] }
  ],
  "Los Angeles": [
    { name: "TCL Chinese Theatre", amenities: ["IMAX", "Dolby Atmos"], timings: ["12:00 PM", "03:45 PM", "07:00 PM", "10:30 PM"] },
    { name: "AMC The Grove 14", amenities: ["Dolby Cinema", "Recliners"], timings: ["10:15 AM", "01:30 PM", "04:20 PM", "08:15 PM"] },
    { name: "El Capitan Theatre", amenities: ["Dolby Vision", "Atmos"], timings: ["10:00 AM", "02:00 PM", "06:00 PM", "09:30 PM"] }
  ],
  "Chicago": [
    { name: "AMC River East 21", amenities: ["IMAX", "Food"], timings: ["11:45 AM", "03:00 PM", "06:30 PM", "09:45 PM"] },
    { name: "Showplace ICON", amenities: ["Dolby Atmos", "VIP Lounge"], timings: ["12:30 PM", "04:00 PM", "08:00 PM"] }
  ],
  "San Francisco": [
    { name: "AMC Metreon 16", amenities: ["IMAX 70mm", "Dolby Atmos"], timings: ["11:15 AM", "02:45 PM", "06:15 PM", "09:45 PM"] },
    { name: "Alamo Drafthouse New Mission", amenities: ["Dine-In", "Dolby Atmos"], timings: ["12:45 PM", "04:30 PM", "08:15 PM"] }
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
  
  const movieId = Number(searchParams.get("movie") || 1);
  const movie = allMovies[movieId] || allMovies[1];
  
  const [selectedCity, setSelectedCity] = useState("New York");
  const [activeFilter, setActiveFilter] = useState("All");
  
  const dates = getNextDays(5);
  const [selectedDateStr, setSelectedDateStr] = useState(dates[0].fullDateStr);

  const theatres = locationsData[selectedCity] || [];

  const handleTimeClick = (theatreName: string, time: string) => {
    // Navigate to Seat Selection
    router.push(`/seats?movie=${movieId}&theatre=${encodeURIComponent(theatreName)}&date=${selectedDateStr}&time=${encodeURIComponent(time)}`);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Header - Movie Info */}
        <div className={styles.headerSection}>
          <img src={movie.image} alt={movie.title} className={styles.moviePoster} />
          <div className={styles.movieInfo}>
            <h1>{movie.title}</h1>
            <div className={styles.movieMeta}>
              <span className={styles.ratingBadge}>⭐ {movie.rating}</span>
              <span>•</span>
              <span>🎭 {movie.genre}</span>
              <span>•</span>
              <span>⏱ {movie.duration}</span>
            </div>
          </div>
        </div>

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
