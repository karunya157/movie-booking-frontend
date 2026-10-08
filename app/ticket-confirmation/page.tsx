"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import styles from "./confirmation.module.css";

function ConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { width, height } = useWindowSize();


  const transactionId = searchParams.get("txnId") || "TXN01638148";
  const movieTitle = searchParams.get("movieTitle") || "Civil War";
  const seats = searchParams.get("seats") || "B10, B9, B11";
  const showDate = searchParams.get("date") || "2026-04-22";
  const showTime = searchParams.get("time") || "07:30 PM";
  const method = searchParams.get("method") || "cash";
  const amount = searchParams.get("amount") || "3549.00";

  interface SnackItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    emoji: string;
    total?: number;
  }

  const [snacksList, setSnacksList] = React.useState<SnackItem[]>([]);

  React.useEffect(() => {
    try {
      const param = searchParams.get("snacks");
      if (param) {
        const parsed = JSON.parse(decodeURIComponent(param));
        if (Array.isArray(parsed)) setSnacksList(parsed);
      } else if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("movie_booking_snacks");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setSnacksList(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to parse snacks in confirmation:", e);
    }
  }, [searchParams]);

  return (
    <div className={styles.pageWrapper}>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.15}
      />
      <div className={styles.container}>
        {/* Progress Steps */}
        <div className={styles.progressBar}>
          <div className={styles.progressStep}>
            <div className={`${styles.stepCircle} ${styles.completed}`}>✓</div>
            <span className={`${styles.stepLabel} ${styles.completed}`}>Movie</span>
          </div>
          <div className={`${styles.stepConnector} ${styles.completed}`}></div>
          <div className={styles.progressStep}>
            <div className={`${styles.stepCircle} ${styles.completed}`}>✓</div>
            <span className={`${styles.stepLabel} ${styles.completed}`}>Seats</span>
          </div>
          <div className={`${styles.stepConnector} ${styles.completed}`}></div>
          <div className={styles.progressStep}>
            <div className={`${styles.stepCircle} ${styles.completed}`}>✓</div>
            <span className={`${styles.stepLabel} ${styles.completed}`}>Payment</span>
          </div>
          <div className={`${styles.stepConnector} ${styles.completed}`}></div>
          <div className={styles.progressStep}>
            <div className={`${styles.stepCircle} ${styles.active}`}>4</div>
            <span className={`${styles.stepLabel} ${styles.active}`}>Confirmation</span>
          </div>
        </div>

        <div className={styles.successContainer}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>
              {method === "cash" ? "Seats Reserved!" : "Payment Successful!"}
            </h2>
            <p className={styles.successMessage}>
              {method === "cash"
                ? `Your seats have been reserved. Please pay ₹${amount} at the theatre counter before the show.`
                : `Your payment of ₹${amount} was processed successfully. Your e-tickets have been sent to your email.`}
            </p>
            <div className={styles.successDetails}>
              <div className={styles.successDetailRow}>
                <span>Transaction ID</span>
                <span>{transactionId}</span>
              </div>
              <div className={styles.successDetailRow}>
                <span>Movie</span>
                <span>{movieTitle}</span>
              </div>
              <div className={styles.successDetailRow}>
                <span>Seats</span>
                <span style={{ lineHeight: 1.5 }}>{seats.split(",").join(", ")}</span>
              </div>
              <div className={styles.successDetailRow}>
                <span>Date &amp; Time</span>
                <span>{showDate} at {showTime}</span>
              </div>
              {snacksList.length > 0 && (
                <div className={styles.successDetailRow} style={{ alignItems: "flex-start" }}>
                  <span>🍿 Food &amp; Snacks</span>
                  <div style={{ textAlign: "right" }}>
                    {snacksList.map(s => (
                      <div key={s.id} style={{ fontSize: "0.85rem", color: "#ddd" }}>
                        {s.emoji} {s.name} × {s.quantity}
                      </div>
                    ))}
                    <div style={{ fontSize: "0.74rem", color: "#00e676", marginTop: "3px" }}>
                      ⚡ Pre-booked • Seat Delivery / Express Pickup
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.successDetailRow}>
                <span>Payment Method</span>
                <span>{method === "card" ? "Card" : method === "upi" ? "UPI" : "Cash at Theatre"}</span>
              </div>
              <div className={styles.successDetailRow}>
                <span>Amount</span>
                <span style={{ color: "#00c864", fontWeight: 700 }}>₹{amount}</span>
              </div>
            </div>
            <div className={styles.successActions}>
              <button
                className={`${styles.successBtn} ${styles.successBtnPrimary}`}
                onClick={() => router.push("/user/bookings")}
              >
                View My Bookings
              </button>
              <button
                className={`${styles.successBtn} ${styles.successBtnSecondary}`}
                onClick={() => router.push("/movies")}
              >
                Browse More Movies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "white", textAlign: "center" }}>Loading Confirmation...</div>}>
      <ConfirmationPageContent />
    </Suspense>
  );
}
