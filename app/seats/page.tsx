"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./seats.module.css";

/* ===== Movie data (mirrors movies page) ===== */
const allMovies: Record<number, { title: string }> = {
  1: { title: "Dune: Part Two" },
  2: { title: "Godzilla x Kong" },
  3: { title: "Kung Fu Panda 4" },
  4: { title: "Civil War" },
  5: { title: "The Batman" },
  6: { title: "Oppenheimer" },
  7: { title: "Avatar: The Way of Water" },
  8: { title: "Top Gun: Maverick" },
};

/* ===== Seat Map Configuration ===== */
const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const seatsPerRow = 12; // 6 left, gap, 6 right
const SEAT_PRICE = 250; 

function SeatsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const movieId = Number(searchParams.get("movie") || 1);
  const movieTitle = allMovies[movieId]?.title || "Movie";
  const theatre = searchParams.get("theatre") || "AMC Empire 25";
  const date = searchParams.get("date") || "2026-04-20";
  const time = searchParams.get("time") || "19:30";

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);

  // Randomly generate some occupied seats on load for realism
  useEffect(() => {
    const occupied: string[] = [];
    rows.forEach(r => {
      for(let i=1; i<=seatsPerRow; i++) {
        if(Math.random() < 0.25) { // 25% chance of being occupied
          occupied.push(`${r}${i}`);
        }
      }
    });
    setOccupiedSeats(occupied);
  }, []);

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    const seatsStr = selectedSeats.join(",");
    router.push(`/payment?movie=${movieId}&theatre=${encodeURIComponent(theatre)}&date=${date}&time=${encodeURIComponent(time)}&seats=${seatsStr}`);
  };

  const renderRow = (rowLabel: string) => {
    const seats = [];
    for (let i = 1; i <= seatsPerRow; i++) {
      const seatId = `${rowLabel}${i}`;
      const isOccupied = occupiedSeats.includes(seatId);
      const isSelected = selectedSeats.includes(seatId);

      seats.push(
        <button
          key={seatId}
          className={`${styles.seat} ${isOccupied ? styles.occupied : ''} ${isSelected ? styles.selected : ''}`}
          onClick={() => toggleSeat(seatId)}
          title={isOccupied ? "Occupied" : seatId}
        >
          {i}
        </button>
      );

      // Add aisle gap in the middle
      if (i === seatsPerRow / 2) {
        seats.push(<div key={`gap-${rowLabel}`} className={styles.gap}></div>);
      }
    }

    return (
      <div key={rowLabel} className={styles.seatRow}>
        <div className={styles.rowLabel}>{rowLabel}</div>
        <div className={styles.rowSeats}>{seats}</div>
        <div className={styles.rowLabel}>{rowLabel}</div>
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Header Summary */}
        <div className={styles.headerSummary}>
          <div className={styles.movieInfo}>
            <h1>{movieTitle}</h1>
            <div className={styles.movieMeta}>
              <span>📍 {theatre}</span>
              <span>•</span>
              <span>📅 {date}</span>
              <span>•</span>
              <span>⏱ {time}</span>
            </div>
          </div>
          <button className={styles.editBtn} onClick={() => router.back()}>Edit Selection</button>
        </div>

        <div className={styles.mainContent}>
          {/* Left panel: Seat Map */}
          <div className={styles.seatMapSection}>
            <div className={styles.screenWrapper}>
              <div className={styles.screenCurve}></div>
              <div className={styles.screenText}>Screen This Way</div>
            </div>

            <div className={styles.seatsContainer}>
              <div className={styles.seatCategory}>Premium — ₹{SEAT_PRICE}</div>
              {rows.slice(0, 4).map(r => renderRow(r))}
              
              <div className={styles.seatCategory}>Standard — ₹{SEAT_PRICE}</div>
              {rows.slice(4).map(r => renderRow(r))}
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.available}`}></div>
                <span>Available</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.selected}`}></div>
                <span>Selected</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.occupied}`}></div>
                <span>Occupied</span>
              </div>
            </div>
          </div>

          {/* Right panel: Summary */}
          <div className={styles.summarySection}>
            <h2 className={styles.summaryTitle}>Booking Summary</h2>
            
            {selectedSeats.length > 0 ? (
              <>
                <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>Selected Seats ({selectedSeats.length})</div>
                <div className={styles.selectedSeatsList}>
                  {selectedSeats.map(s => (
                    <span key={s} className={styles.seatBadge}>{s}</span>
                  ))}
                </div>
                
                <div className={styles.priceRow}>
                  <span>Tickets</span>
                  <span>₹{(selectedSeats.length * SEAT_PRICE).toFixed(2)}</span>
                </div>
                
                <div className={styles.priceTotal}>
                  <span>Subtotal</span>
                  <span>₹{(selectedSeats.length * SEAT_PRICE).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div style={{ color: '#666', textAlign: 'center', padding: '30px 0' }}>
                Please select your seats to proceed.
              </div>
            )}

            <button 
              className={styles.payBtn} 
              disabled={selectedSeats.length === 0}
              onClick={handleProceed}
            >
              Proceed to Payment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SeatsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading Seats...</div>}>
      <SeatsPageContent />
    </Suspense>
  );
}
