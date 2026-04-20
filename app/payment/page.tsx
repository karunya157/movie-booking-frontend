"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./payment.module.css";

/* ===== Movie data (mirrors movies page) ===== */
const allMovies: Record<number, { title: string; image: string; genre: string; duration: string; language: string }> = {
  1: { title: "Dune: Part Two", image: "/dune.png", genre: "Sci-Fi / Adventure", duration: "166 min", language: "English" },
  2: { title: "Godzilla x Kong", image: "/godzilla.png", genre: "Action / Sci-Fi", duration: "115 min", language: "English" },
  3: { title: "Kung Fu Panda 4", image: "/kungfu.png", genre: "Animation / Family", duration: "94 min", language: "English" },
  4: { title: "Civil War", image: "/civilwar.png", genre: "Action / Thriller", duration: "109 min", language: "English" },
  5: { title: "The Batman", image: "/batman.jpg", genre: "Action / Crime", duration: "176 min", language: "English" },
  6: { title: "Oppenheimer", image: "/oppenheimer.jpg", genre: "Drama / History", duration: "180 min", language: "English" },
  7: { title: "Avatar: The Way of Water", image: "/avatar.jpg", genre: "Sci-Fi / Fantasy", duration: "192 min", language: "English" },
  8: { title: "Top Gun: Maverick", image: "/topgun.jpg", genre: "Action / Drama", duration: "130 min", language: "English" },
};

/* ===== Types ===== */
type PaymentMethod = "card" | "upi" | "cash";

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

interface CardErrors {
  number?: string;
  name?: string;
  expiry?: string;
  cvv?: string;
}

/* ===== Helper: detect card brand ===== */
function getCardBrand(num: string): string {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "💳 Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "💳 Mastercard";
  if (/^3[47]/.test(n)) return "💳 Amex";
  if (/^6(?:011|5)/.test(n)) return "💳 Discover";
  return "💳";
}

/* ===== Helper: format card number ===== */
function formatCardNumber(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 16);
  return v.replace(/(.{4})/g, "$1 ").trim();
}

/* ===== Helper: format expiry ===== */
function formatExpiry(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 3) {
    return v.slice(0, 2) + "/" + v.slice(2);
  }
  if (v.length === 2 && value.endsWith("/")) {
    return v + "/";
  }
  return v;
}

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

/* ===== Inner component that uses useSearchParams ===== */
function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);

  /* Extract booking info from query params */
  const movieId = Number(searchParams.get("movie") || 1);
  const seats = searchParams.get("seats")?.split(",") || ["A1", "A2"];
  const showDate = searchParams.get("date") || "2026-04-20";
  const showTime = searchParams.get("time") || "19:30";

  const movie = allMovies[movieId] || allMovies[1];
  const seatPrice = 250;
  const convenienceFee = 49;
  const totalSeats = seats.length;
  const subtotal = totalSeats * seatPrice;
  const total = subtotal + convenienceFee;

  /* State */
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  /* Card state */
  const [card, setCard] = useState<CardData>({ number: "", name: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState<CardErrors>({});

  /* UPI state */
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("");
  const [upiError, setUpiError] = useState("");

  /* Cash state */
  const [cashConfirmed, setCashConfirmed] = useState(false);

  /* ===== Validation ===== */
  function validateCard(): boolean {
    const errors: CardErrors = {};
    const num = card.number.replace(/\s/g, "");
    if (!num || num.length < 13 || num.length > 16) errors.number = "Enter a valid card number (13-16 digits)";
    if (!card.name.trim() || card.name.trim().length < 2) errors.name = "Enter the cardholder name";
    if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) errors.expiry = "Enter a valid expiry (MM/YY)";
    else {
      const [mm, yy] = card.expiry.split("/").map(Number);
      if (mm < 1 || mm > 12) errors.expiry = "Invalid month";
    }
    if (!card.cvv || card.cvv.length < 3 || card.cvv.length > 4) errors.cvv = "Enter a valid CVV";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateUpi(): boolean {
    if (!upiId.trim() && !selectedUpiApp) {
      setUpiError("Enter your UPI ID or select an app");
      return false;
    }
    if (upiId.trim() && !upiId.includes("@")) {
      setUpiError("Enter a valid UPI ID (e.g., name@upi)");
      return false;
    }
    setUpiError("");
    return true;
  }

  /* ===== Payment handling ===== */
  async function handlePay() {
    if (!user) {
      alert("Please login to complete your booking.");
      router.push("/login");
      return;
    }

    if (method === "card" && !validateCard()) return;
    if (method === "upi" && !validateUpi()) return;
    if (method === "cash" && !cashConfirmed) return;

    setProcessing(true);

    try {
      // Save booking to DB
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          movieId,
          movieTitle: movie.title,
          seats,
          date: showDate,
          time: showTime,
          amount: total,
          method,
          image: movie.image,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save booking");
      }

      setProcessing(false);
      const newTxnId = data.booking.id;
      router.push(`/ticket-confirmation?txnId=${newTxnId}&movieTitle=${encodeURIComponent(movie.title)}&seats=${seats.join(",")}&date=${showDate}&time=${encodeURIComponent(showTime)}&method=${method}&amount=${total.toFixed(2)}`);
    } catch (error: any) {
      console.error("Booking Error:", error);
      setProcessing(false);
      alert(error.message || "Something went wrong during booking.");
    }
  }

  /* ===== Card display values ===== */
  const displayNumber = card.number || "•••• •••• •••• ••••";
  const displayName = card.name || "YOUR NAME";
  const displayExpiry = card.expiry || "MM/YY";

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>💳 Secure Payment</h1>
          <p className={styles.pageSubtitle}>Complete your booking in a few simple steps</p>
        </div>

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
            <div className={`${styles.stepCircle} ${styles.active}`}>3</div>
            <span className={`${styles.stepLabel} ${styles.active}`}>Payment</span>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={styles.progressStep}>
            <div className={styles.stepCircle}>4</div>
            <span className={styles.stepLabel}>Confirmation</span>
          </div>
        </div>

        {/* Main Layout */}
        <div className={styles.paymentLayout}>
          {/* Left: Payment Methods */}
          <div className={styles.paymentSection}>
            <h2 className={styles.sectionTitle}>🔒 Choose Payment Method</h2>

            {/* Method Tabs */}
            <div className={styles.methodTabs}>
              <button
                id="payment-method-card"
                className={`${styles.methodTab} ${method === "card" ? styles.selected : ""}`}
                onClick={() => setMethod("card")}
              >
                <span className={styles.methodIcon}>💳</span>
                <span className={styles.methodLabel}>Credit / Debit Card</span>
                <div className={`${styles.radioIndicator} ${method === "card" ? styles.checked : ""}`}></div>
              </button>

              <button
                id="payment-method-upi"
                className={`${styles.methodTab} ${method === "upi" ? styles.selected : ""}`}
                onClick={() => setMethod("upi")}
              >
                <span className={styles.methodIcon}>📱</span>
                <span className={styles.methodLabel}>UPI Payment</span>
                <div className={`${styles.radioIndicator} ${method === "upi" ? styles.checked : ""}`}></div>
              </button>

              <button
                id="payment-method-cash"
                className={`${styles.methodTab} ${method === "cash" ? styles.selected : ""}`}
                onClick={() => setMethod("cash")}
              >
                <span className={styles.methodIcon}>💵</span>
                <span className={styles.methodLabel}>Pay at Theatre</span>
                <div className={`${styles.radioIndicator} ${method === "cash" ? styles.checked : ""}`}></div>
              </button>
            </div>

            {/* ===== CARD FORM ===== */}
            {method === "card" && (
              <div className={styles.formContainer} key="card">
                <div className={styles.cardForm}>
                  {/* Interactive Card Visual */}
                  <div className={styles.cardVisual}>
                    <span className={styles.cardBrand}>{getCardBrand(card.number)}</span>
                    <div className={styles.cardChip}></div>
                    <div className={styles.cardNumber}>{displayNumber}</div>
                    <div className={styles.cardBottom}>
                      <div>
                        <div className={styles.cardHolder}>Card Holder</div>
                        <div className={styles.cardHolderName}>{displayName}</div>
                      </div>
                      <div className={styles.cardExpiry}>
                        <span>Valid Thru</span>
                        <span>{displayExpiry}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className={styles.inputGroup}>
                    <label htmlFor="card-number">Card Number</label>
                    <input
                      id="card-number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                      className={cardErrors.number ? styles.inputError : ""}
                      maxLength={19}
                    />
                    {cardErrors.number && <span className={styles.errorText}>{cardErrors.number}</span>}
                  </div>

                  {/* Cardholder Name */}
                  <div className={styles.inputGroup}>
                    <label htmlFor="card-name">Cardholder Name</label>
                    <input
                      id="card-name"
                      type="text"
                      placeholder="John Doe"
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      className={cardErrors.name ? styles.inputError : ""}
                    />
                    {cardErrors.name && <span className={styles.errorText}>{cardErrors.name}</span>}
                  </div>

                  {/* Expiry + CVV Row */}
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="card-expiry">Expiry Date</label>
                      <input
                        id="card-expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        className={cardErrors.expiry ? styles.inputError : ""}
                        maxLength={5}
                      />
                      {cardErrors.expiry && <span className={styles.errorText}>{cardErrors.expiry}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="card-cvv">CVV</label>
                      <input
                        id="card-cvv"
                        type="password"
                        placeholder="•••"
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        className={cardErrors.cvv ? styles.inputError : ""}
                        maxLength={4}
                      />
                      {cardErrors.cvv && <span className={styles.errorText}>{cardErrors.cvv}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== UPI FORM ===== */}
            {method === "upi" && (
              <div className={styles.formContainer} key="upi">
                <div className={styles.upiForm}>
                  {/* Popular UPI Apps */}
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#888", fontWeight: 600, marginBottom: 10, display: "block" }}>
                      Select UPI App
                    </label>
                    <div className={styles.upiApps}>
                      {[
                        { id: "gpay", icon: "🟢", name: "Google Pay" },
                        { id: "phonepe", icon: "🟣", name: "PhonePe" },
                        { id: "paytm", icon: "🔵", name: "Paytm" },
                        { id: "bhim", icon: "🟠", name: "BHIM UPI" },
                      ].map((app) => (
                        <button
                          key={app.id}
                          id={`upi-app-${app.id}`}
                          className={`${styles.upiApp} ${selectedUpiApp === app.id ? styles.selectedApp : ""}`}
                          onClick={() => { setSelectedUpiApp(app.id); setUpiError(""); }}
                        >
                          <span className={styles.upiAppIcon}>{app.icon}</span>
                          <span className={styles.upiAppName}>{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.upiDividerText}>or enter UPI ID manually</div>

                  {/* UPI ID Input */}
                  <div className={styles.inputGroup}>
                    <label htmlFor="upi-id">UPI ID</label>
                    <input
                      id="upi-id"
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setUpiError(""); }}
                      className={upiError ? styles.inputError : ""}
                    />
                    {upiError && <span className={styles.errorText}>{upiError}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ===== CASH FORM ===== */}
            {method === "cash" && (
              <div className={styles.formContainer} key="cash">
                <div className={styles.cashForm}>
                  {/* Info Notice */}
                  <div className={styles.cashInfo}>
                    <div className={styles.cashInfoHeader}>
                      <span>ℹ️</span>
                      <h4>Pay at Theatre Counter</h4>
                    </div>
                    <ul className={styles.cashInfoList}>
                      <li><span>✅</span> Your seats will be reserved for 30 minutes</li>
                      <li><span>✅</span> Pay the exact amount at the box office counter</li>
                      <li><span>✅</span> Carry a valid photo ID for verification</li>
                      <li><span>⚠️</span> Reservation expires if payment is not made within 30 minutes before showtime</li>
                    </ul>
                  </div>

                  {/* Steps */}
                  <div className={styles.cashSteps}>
                    <div className={styles.cashStep}>
                      <span className={styles.cashStepNum}>1</span>
                      <div className={styles.cashStepText}>
                        <h5>Confirm Reservation</h5>
                        <p>Your seats will be held temporarily</p>
                      </div>
                    </div>
                    <div className={styles.cashStep}>
                      <span className={styles.cashStepNum}>2</span>
                      <div className={styles.cashStepText}>
                        <h5>Visit the Theatre</h5>
                        <p>Go to the box office counter before showtime</p>
                      </div>
                    </div>
                    <div className={styles.cashStep}>
                      <span className={styles.cashStepNum}>3</span>
                      <div className={styles.cashStepText}>
                        <h5>Pay &amp; Collect Tickets</h5>
                        <p>Show your booking ID and pay ₹{total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className={styles.cashCheckbox}>
                    <input
                      type="checkbox"
                      id="cash-confirm"
                      checked={cashConfirmed}
                      onChange={(e) => setCashConfirmed(e.target.checked)}
                    />
                    <label htmlFor="cash-confirm">
                      I understand that I need to pay at the theatre counter before showtime
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              id="pay-now-button"
              className={styles.payButton}
              onClick={handlePay}
              disabled={method === "cash" && !cashConfirmed}
            >
              {method === "cash"
                ? `Reserve Seats — ₹${total.toFixed(2)}`
                : `Pay ₹${total.toFixed(2)} Securely`}
            </button>

            {/* Secure Badge */}
            <div className={styles.secureBadge}>
              <span>🔒</span>
              <span>256-bit SSL Encrypted &bull; Your data is safe</span>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>🎟️ Order Summary</h3>

            <div className={styles.summaryMovie}>
              <div className={styles.summaryPoster}>
                <img src={movie.image} alt={movie.title} />
              </div>
              <div className={styles.summaryMovieInfo}>
                <h4>{movie.title}</h4>
                <p>{movie.genre}</p>
                <p>⏱ {movie.duration} &bull; 🌐 {movie.language}</p>
              </div>
            </div>

            <div className={styles.summaryRow}>
              <span>Date</span>
              <span>{showDate}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Showtime</span>
              <span>{showTime}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Seats</span>
              <span>{seats.join(", ")}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Ticket Price ({totalSeats}×)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Convenience Fee</span>
              <span>₹{convenienceFee.toFixed(2)}</span>
            </div>
            <hr className={styles.summaryDivider} />
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {processing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingContent}>
            <div className={styles.spinner}></div>
            <p className={styles.processingText}>
              {method === "cash" ? "Reserving your seats..." : "Processing payment..."}
            </p>
            <p className={styles.processingSubtext}>Please do not close this page</p>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {success && (
        <div className={styles.successOverlay}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>
              {method === "cash" ? "Seats Reserved!" : "Payment Successful!"}
            </h2>
            <p className={styles.successMessage}>
              {method === "cash"
                ? `Your seats have been reserved. Please pay ₹${total.toFixed(2)} at the theatre counter before the show.`
                : `Your payment of ₹${total.toFixed(2)} was processed successfully. Your e-tickets have been sent to your email.`}
            </p>
            <div className={styles.successDetails}>
              <div className={styles.successDetailRow}>
                <span>Transaction ID</span>
                <span>{transactionId}</span>
              </div>
              <div className={styles.successDetailRow}>
                <span>Movie</span>
                <span>{movie.title}</span>
              </div>
              <div className={styles.successDetailRow}>
                <span>Seats</span>
                <span>{seats.join(", ")}</span>
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
                <span style={{ color: "#00c864", fontWeight: 700 }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.successActions}>
              <button
                id="view-bookings-btn"
                className={`${styles.successBtn} ${styles.successBtnPrimary}`}
                onClick={() => router.push("/user/bookings")}
              >
                View My Bookings
              </button>
              <button
                id="browse-more-btn"
                className={`${styles.successBtn} ${styles.successBtnSecondary}`}
                onClick={() => router.push("/movies")}
              >
                Browse More Movies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Main export with Suspense boundary ===== */
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>💳 Loading Payment...</h1>
          </div>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
