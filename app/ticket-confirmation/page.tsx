"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./confirmation.module.css";

function ConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("txnId") || "TXN01638148";
  const movieTitle = searchParams.get("movieTitle") || "Civil War";
  const seats = searchParams.get("seats") || "B10, B9, B11";
  const showDate = searchParams.get("date") || "2026-04-22";
  const showTime = searchParams.get("time") || "07:30 PM";
  const method = searchParams.get("method") || "cash";
  const amount = searchParams.get("amount") || "3549.00";

  return (
    <div className={styles.pageWrapper}>
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
