"use client";
import toast from 'react-hot-toast';

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import styles from "./payment.module.css";
import { defaultMoviesList } from "@/data/movies";

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

function formatCardNumber(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 16);
  return v.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  // Allow user to backspace through slash cleanly
  if (value.length === 2 && !value.includes("/")) {
    let m = parseInt(value, 10);
    if (m > 12) m = 12;
    if (m === 0) return "01";
    return m < 10 ? `0${m}` : `${m}`;
  }

  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";

  if (digits.length === 1) {
    // If user enters 2-9 as first digit, auto prepend '0' so e.g. 7 becomes '07/'
    if (Number(digits) > 1) {
      return `0${digits}/`;
    }
    return digits;
  }

  let mm = digits.slice(0, 2);
  let yy = digits.slice(2);

  let mNum = parseInt(mm, 10);
  if (mNum > 12) {
    mNum = 12;
  } else if (mNum === 0) {
    mNum = 1;
  }
  mm = mNum < 10 ? `0${mNum}` : `${mNum}`;

  if (digits.length >= 2) {
    if (yy.length === 1) {
      // First digit of year: if user types > 3, clamp to 3 because max year is 32 (2032)
      if (parseInt(yy, 10) > 3) {
        yy = "3";
      }
      return `${mm}/${yy}`;
    }
    if (yy.length === 2) {
      let yNum = parseInt(yy, 10);
      // Max allowed year is 32. Any year > 32 is strictly clamped to 32
      if (yNum > 32) {
        yNum = 32;
      }
      yy = yNum < 10 ? `0${yNum}` : `${yNum}`;
      return `${mm}/${yy}`;
    }
    return `${mm}/`;
  }

  return mm;
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);

  React.useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let currentUser = user;
    if (!currentUser && storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {}
    }
    if (!currentUser) {
      toast.error("Please login to complete your payment!");
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }
    if (currentUser.role === "admin") {
      toast.error("Admin accounts cannot book tickets. Please login as a customer.");
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }
  }, [user, router]);

  const movieId = Number(searchParams.get("movie") || 2);
  const seats = searchParams.get("seats")?.split(",") || ["A1", "A2"];
  const showDate = searchParams.get("date") || "2026-04-20";
  const showTime = searchParams.get("time") || "19:30";

  const localMovie = defaultMoviesList.find((m) => m.id === movieId);
  const [movie, setMovie] = useState<{ title: string; image: string; genre: string; duration: string; language: string }>({
    title: localMovie?.title || "Movie",
    image: localMovie?.image || "https://via.placeholder.com/300x450.png?text=Movie",
    genre: localMovie?.genre || "Cinema",
    duration: localMovie?.duration || "150 min",
    language: localMovie?.language || "Tamil",
  });

  React.useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const res = await fetch("/api/movies");
        if (res.ok) {
          const movies = await res.json();
          const current = movies.find((m: { id: number; title: string; image: string; genre: string; duration: string; language: string }) => m.id === movieId);
          if (current) {
            setMovie({
              title: current.title,
              image: current.image || "/leo.jpg",
              genre: current.genre || "Action",
              duration: current.duration || "150 min",
              language: current.language || "Tamil"
            });
          }
        }
      } catch (err) {
        console.error("Failed to load movie:", err);
      }
    };
    fetchMovieData();
  }, [movieId]);

  interface SnackItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    emoji: string;
    total: number;
  }

  const [snacksList, setSnacksList] = useState<SnackItem[]>([]);

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
      console.error("Failed to parse snacks param:", e);
    }
  }, [searchParams]);

  const PREMIUM_ROWS = ["A", "B", "C", "D"];
  const PREMIUM_PRICE = 300;
  const STANDARD_PRICE = 180;

  const isPremiumSeat = (seat: string) => PREMIUM_ROWS.includes(seat.trim().charAt(0).toUpperCase());
  const premiumSeats = seats.filter(isPremiumSeat);
  const standardSeats = seats.filter(s => !isPremiumSeat(s));
  
  const premiumTotal = premiumSeats.length * PREMIUM_PRICE;
  const standardTotal = standardSeats.length * STANDARD_PRICE;
  
  const calculatedSeatsTotal = premiumTotal + standardTotal;
  const seatsTotalParam = searchParams.get("seatsTotal");
  const seatsTotal = seatsTotalParam ? Number(seatsTotalParam) : calculatedSeatsTotal;

  const calculatedFoodTotal = snacksList.reduce((acc, s) => acc + (s.total || s.price * s.quantity), 0);
  const foodTotalParam = searchParams.get("foodTotal");
  const foodTotal = foodTotalParam ? Number(foodTotalParam) : calculatedFoodTotal;

  const subtotalParam = searchParams.get("subtotal");
  const subtotal = subtotalParam ? Number(subtotalParam) : (seatsTotal + foodTotal);
  const convenienceFee = 49;
  const total = subtotal + convenienceFee;

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);

  const [card, setCard] = useState<CardData>({ number: "", name: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState<CardErrors>({});

  React.useEffect(() => {
    // Clear CVV on mount so browser password managers/autofill cannot pre-fill it
    setCard((prev) => ({ ...prev, cvv: "" }));
  }, []);

  const [upiMode, setUpiMode] = useState<"qr" | "id">("qr");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [isPayingWithApp, setIsPayingWithApp] = useState(false);
  const [qrPaid, setQrPaid] = useState(false);

  const [cashConfirmed, setCashConfirmed] = useState(false);

  // Fallback offline SVG QR Code pattern generator to guarantee 100% visible QR code
  function renderSvgQr() {
    return (
      <svg viewBox="0 0 100 100" width="190" height="190" style={{ display: 'block', borderRadius: '4px' }}>
        <rect width="100" height="100" fill="#ffffff" />
        {/* Corner 1 (Top-Left) */}
        <rect x="6" y="6" width="26" height="26" fill="#000000" rx="3" />
        <rect x="11" y="11" width="16" height="16" fill="#ffffff" rx="2" />
        <rect x="15" y="15" width="8" height="8" fill="#000000" rx="1" />

        {/* Corner 2 (Top-Right) */}
        <rect x="68" y="6" width="26" height="26" fill="#000000" rx="3" />
        <rect x="73" y="11" width="16" height="16" fill="#ffffff" rx="2" />
        <rect x="77" y="15" width="8" height="8" fill="#000000" rx="1" />

        {/* Corner 3 (Bottom-Left) */}
        <rect x="6" y="68" width="26" height="26" fill="#000000" rx="3" />
        <rect x="11" y="73" width="16" height="16" fill="#ffffff" rx="2" />
        <rect x="15" y="77" width="8" height="8" fill="#000000" rx="1" />

        {/* Timing Lines */}
        <rect x="36" y="17" width="4" height="4" fill="#000000" />
        <rect x="44" y="17" width="4" height="4" fill="#000000" />
        <rect x="52" y="17" width="4" height="4" fill="#000000" />
        <rect x="60" y="17" width="4" height="4" fill="#000000" />
        <rect x="17" y="36" width="4" height="4" fill="#000000" />
        <rect x="17" y="44" width="4" height="4" fill="#000000" />
        <rect x="17" y="52" width="4" height="4" fill="#000000" />
        <rect x="17" y="60" width="4" height="4" fill="#000000" />

        {/* Dense Grid Pattern for realistic QR code appearance */}
        <rect x="36" y="36" width="7" height="7" fill="#000000" />
        <rect x="47" y="36" width="6" height="6" fill="#000000" />
        <rect x="57" y="36" width="7" height="7" fill="#000000" />
        <rect x="36" y="47" width="6" height="6" fill="#000000" />
        <rect x="46" y="46" width="8" height="8" fill="#e50914" rx="2" /> {/* Red center accent */}
        <rect x="58" y="47" width="6" height="6" fill="#000000" />
        <rect x="36" y="57" width="7" height="7" fill="#000000" />
        <rect x="47" y="57" width="6" height="6" fill="#000000" />
        <rect x="57" y="57" width="7" height="7" fill="#000000" />

        {/* Outer Data matrix clusters */}
        <rect x="36" y="6" width="5" height="5" fill="#000000" />
        <rect x="45" y="10" width="6" height="4" fill="#000000" />
        <rect x="55" y="6" width="6" height="6" fill="#000000" />
        <rect x="6" y="36" width="6" height="6" fill="#000000" />
        <rect x="6" y="46" width="6" height="6" fill="#000000" />
        <rect x="6" y="56" width="6" height="6" fill="#000000" />
        <rect x="68" y="36" width="6" height="6" fill="#000000" />
        <rect x="78" y="38" width="6" height="5" fill="#000000" />
        <rect x="88" y="36" width="6" height="6" fill="#000000" />
        <rect x="68" y="46" width="5" height="5" fill="#000000" />
        <rect x="77" y="48" width="6" height="6" fill="#000000" />
        <rect x="87" y="46" width="7" height="6" fill="#000000" />
        <rect x="68" y="56" width="6" height="6" fill="#000000" />
        <rect x="78" y="58" width="5" height="5" fill="#000000" />
        <rect x="88" y="56" width="6" height="6" fill="#000000" />
        <rect x="36" y="68" width="5" height="6" fill="#000000" />
        <rect x="45" y="68" width="6" height="5" fill="#000000" />
        <rect x="55" y="68" width="7" height="6" fill="#000000" />
        <rect x="36" y="78" width="6" height="6" fill="#000000" />
        <rect x="46" y="77" width="5" height="6" fill="#000000" />
        <rect x="55" y="78" width="6" height="6" fill="#000000" />
        <rect x="36" y="88" width="6" height="6" fill="#000000" />
        <rect x="46" y="88" width="6" height="6" fill="#000000" />
        <rect x="56" y="88" width="5" height="6" fill="#000000" />
        <rect x="68" y="68" width="8" height="8" fill="#000000" />
        <rect x="80" y="68" width="6" height="6" fill="#000000" />
        <rect x="88" y="76" width="6" height="6" fill="#000000" />
        <rect x="68" y="80" width="7" height="7" fill="#000000" />
        <rect x="78" y="86" width="7" height="7" fill="#000000" />
        <rect x="88" y="86" width="6" height="6" fill="#000000" />
      </svg>
    );
  }

  // Handle clicking on any of the 4 UPI apps to send amount and show paid
  function handleSelectUpiApp(appName: string) {
    if (qrPaid) return;
    setSelectedUpiApp(appName);
    setIsPayingWithApp(true);

    toast.loading(`Opening ${appName} to send ₹${total.toFixed(2)}...`, { id: "upi-pay" });

    setTimeout(() => {
      setIsPayingWithApp(false);
      setQrPaid(true);
      toast.success(`₹${total.toFixed(2)} Paid successfully via ${appName}! ✅`, { id: "upi-pay" });
    }, 1800);
  }

  function validateCard(): boolean {
    const errors: CardErrors = {};
    const num = card.number.replace(/\s/g, "");
    if (!num || num.length < 13 || num.length > 16) errors.number = "Enter a valid card number (16 digits)";
    if (!card.name.trim() || card.name.trim().length < 2) errors.name = "Enter cardholder name";

    if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) {
      errors.expiry = "Enter valid expiry (MM/YY)";
    } else {
      const [mmStr, yyStr] = card.expiry.split("/");
      const month = parseInt(mmStr, 10);
      const year2Digit = parseInt(yyStr, 10);
      const year = parseInt("20" + yyStr, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        errors.expiry = "Month must be between 01 and 12";
      } else if (year2Digit > 32 || year > 2032) {
        errors.expiry = "Expiry year cannot exceed 32 (Max: 2032)";
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = "Card has expired";
      }
    }

    if (!card.cvv || !/^\d{3}$/.test(card.cvv)) {
      errors.cvv = "CVV must be exactly 3 digits";
    }

    setCardErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (errors.expiry) {
        toast.error(errors.expiry);
      } else if (errors.number) {
        toast.error(errors.number);
      } else if (errors.name) {
        toast.error(errors.name);
      } else if (errors.cvv) {
        toast.error(errors.cvv);
      }
      return false;
    }

    return true;
  }

  function validateUpi(): boolean {
    if (upiMode === "qr") {
      return true; // Scanning QR / App is ready to pay
    }
    if (!upiId.trim()) {
      setUpiError("Enter your UPI ID");
      return false;
    }
    setUpiError("");
    return true;
  }

  async function handlePay() {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let currentUser = user;
    if (!currentUser && storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {}
    }
    if (!currentUser) {
      toast.error("Please login to complete your payment!");
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }
    if (currentUser.role === "admin") {
      toast.error("Admin accounts cannot book tickets. Please login as a customer.");
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    if (method === "card" && !validateCard()) {
      return;
    }
    if (method === "upi" && !validateUpi()) return;
    if (method === "cash" && !cashConfirmed) return;

    setProcessing(true);

    try {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const currentUserId = user?.id || parsedUser?.id || 1;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          movieId,
          show_id: movieId,
          movieTitle: movie.title,
          seats,
          date: showDate,
          time: showTime,
          amount: total,
          method,
          image: movie.image,
          snacks: snacksList,
          foodTotal,
          seatsTotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save booking");
      }

      setProcessing(false);
      const newTxnId = data.bookingId || data.booking?.id || 101;
      
      const encodedSnacks = encodeURIComponent(JSON.stringify(snacksList));
      router.push(`/ticket-confirmation?txnId=${newTxnId}&movieTitle=${encodeURIComponent(movie.title)}&seats=${seats.join(",")}&date=${showDate}&time=${encodeURIComponent(showTime)}&method=${method}&amount=${total.toFixed(2)}&foodTotal=${foodTotal}&snacks=${encodedSnacks}`);
    } catch (error: unknown) {
      console.error("Booking Error:", error);
      setProcessing(false);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong during booking.";
      toast.error(errorMessage);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>💳 Secure Payment</h1>
          <p className={styles.pageSubtitle}>Complete your booking in a few simple steps</p>
        </div>

        <div className={styles.paymentLayout}>
          <div className={styles.paymentSection}>
            <h2 className={styles.sectionTitle}>🔒 Choose Payment Method</h2>

            <div className={styles.methodTabs}>
              <button className={`${styles.methodTab} ${method === "card" ? styles.selected : ""}`} onClick={() => setMethod("card")}>
                <span className={styles.methodIcon}>💳</span> Card
              </button>
              <button className={`${styles.methodTab} ${method === "upi" ? styles.selected : ""}`} onClick={() => setMethod("upi")}>
                <span className={styles.methodIcon}>📱</span> UPI
              </button>
              <button className={`${styles.methodTab} ${method === "cash" ? styles.selected : ""}`} onClick={() => setMethod("cash")}>
                <span className={styles.methodIcon}>💵</span> Pay at Theatre
              </button>
            </div>

            {method === "card" && (
              <div className={styles.formContainer}>
                <div className={styles.cardForm}>
                  <div className={styles.inputGroup}>
                    <label>Card Number</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456" 
                      value={card.number} 
                      onChange={(e) => {
                        setCard({ ...card, number: formatCardNumber(e.target.value) });
                        if (cardErrors.number) setCardErrors(prev => ({ ...prev, number: undefined }));
                      }} 
                      maxLength={19} 
                      autoComplete="off"
                      name="cinema_card_num"
                    />
                    {cardErrors.number && <span className={styles.errorText}>{cardErrors.number}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={card.name} 
                      onChange={(e) => {
                        setCard({ ...card, name: e.target.value });
                        if (cardErrors.name) setCardErrors(prev => ({ ...prev, name: undefined }));
                      }} 
                      autoComplete="off"
                      name="cinema_card_holder"
                    />
                    {cardErrors.name && <span className={styles.errorText}>{cardErrors.name}</span>}
                  </div>
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label>Expiry Date (MM/YY)</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={card.expiry} 
                        onChange={(e) => {
                          setCard({ ...card, expiry: formatExpiry(e.target.value) });
                          if (cardErrors.expiry) setCardErrors(prev => ({ ...prev, expiry: undefined }));
                        }} 
                        maxLength={5} 
                        autoComplete="off"
                        name="cinema_card_expiry"
                      />
                      {cardErrors.expiry && <span className={styles.errorText}>{cardErrors.expiry}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                      <label>CVV</label>
                      <input 
                        type="text" 
                        placeholder="•••" 
                        name="card_security_no_autofill"
                        id="card_security_no_autofill"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-lpignore="true"
                        data-form-type="other"
                        data-1p-ignore="true"
                        inputMode="numeric"
                        className={styles.cvvInput}
                        style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                        value={card.cvv} 
                        onChange={(e) => {
                          setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) });
                          if (cardErrors.cvv) setCardErrors(prev => ({ ...prev, cvv: undefined }));
                        }} 
                        maxLength={3} 
                      />
                      {cardErrors.cvv && <span className={styles.errorText}>{cardErrors.cvv}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {method === "upi" && (
              <div className={styles.formContainer}>
                {/* QR Code vs UPI ID toggle */}
                <div className={styles.upiModeTabs}>
                  <button
                    type="button"
                    className={`${styles.upiModeTab} ${upiMode === "qr" ? styles.upiModeTabActive : ""}`}
                    onClick={() => setUpiMode("qr")}
                  >
                    <span>📷</span> Scan QR Code
                  </button>
                  <button
                    type="button"
                    className={`${styles.upiModeTab} ${upiMode === "id" ? styles.upiModeTabActive : ""}`}
                    onClick={() => setUpiMode("id")}
                  >
                    <span>🆔</span> Enter UPI ID
                  </button>
                </div>

                {upiMode === "qr" ? (
                  <div className={styles.qrSection}>
                    <div className={`${styles.qrCard} ${qrPaid ? styles.qrCardPaid : ""}`}>
                      <div className={qrPaid ? styles.qrBadgePaid : styles.qrBadge}>
                        {qrPaid ? "✓ PAYMENT VERIFIED" : "SCAN & PAY"}
                      </div>

                      {qrPaid ? (
                        <div className={styles.paidSuccessBox}>
                          <div className={styles.paidSuccessIcon}>✓</div>
                          <h3 className={styles.paidSuccessTitle}>Paid ₹{total.toFixed(2)}</h3>
                          <p className={styles.paidSuccessSubtitle}>
                            Payment received via <strong>{selectedUpiApp || "UPI App"}</strong>
                          </p>
                          <span className={styles.paidTxnBadge}>Transaction ID: UPI{Math.floor(100000000 + Math.random() * 900000000)}</span>
                        </div>
                      ) : (
                        <>
                          <div className={styles.qrWrapper}>
                            {renderSvgQr()}
                            <div className={styles.qrScanLine}></div>
                            {isPayingWithApp && (
                              <div className={styles.qrPayingOverlay}>
                                <div className={styles.qrSpinner}></div>
                                <span>Processing with {selectedUpiApp}...</span>
                              </div>
                            )}
                          </div>

                          <div className={styles.qrAmount}>
                            Pay <span>₹{total.toFixed(2)}</span>
                          </div>
                          <p className={styles.qrHint}>
                            Click an app below or scan QR with any UPI app
                          </p>
                        </>
                      )}

                      <div className={styles.upiSupportedApps}>
                        {[
                          { name: "GPay", icon: "🌐", color: "#4285F4" },
                          { name: "PhonePe", icon: "🟣", color: "#5f259f" },
                          { name: "Paytm", icon: "🔷", color: "#00b9f5" },
                          { name: "BHIM", icon: "🇮🇳", color: "#00875a" }
                        ].map((app) => (
                          <button
                            key={app.name}
                            type="button"
                            className={`${styles.upiAppBtn} ${selectedUpiApp === app.name ? styles.upiAppBtnActive : ""} ${qrPaid && selectedUpiApp === app.name ? styles.upiAppBtnPaid : ""}`}
                            onClick={() => handleSelectUpiApp(app.name)}
                            disabled={isPayingWithApp}
                            title={`Pay ₹${total.toFixed(2)} using ${app.name}`}
                          >
                            <span className={styles.upiAppBtnIcon}>{app.icon}</span>
                            <span className={styles.upiAppBtnName}>{app.name}</span>
                            {qrPaid && selectedUpiApp === app.name && (
                              <span className={styles.paidTick}>✓ Paid</span>
                            )}
                          </button>
                        ))}
                      </div>

                      {qrPaid && (
                        <button
                          type="button"
                          className={styles.resetUpiBtn}
                          onClick={() => {
                            setQrPaid(false);
                            setSelectedUpiApp(null);
                          }}
                        >
                          Change / Pay Again
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.inputGroup} style={{ marginTop: "12px" }}>
                    <label>UPI ID / VPA</label>
                    <input
                      type="text"
                      placeholder="yourname@upi (e.g. mobile@okaxis)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    {upiError && <span className={styles.errorText}>{upiError}</span>}
                  </div>
                )}
              </div>
            )}

            {method === "cash" && (
              <div className={styles.formContainer}>
                <div className={styles.cashCheckbox}>
                  <input type="checkbox" id="cash-confirm" checked={cashConfirmed} onChange={(e) => setCashConfirmed(e.target.checked)} />
                  <label htmlFor="cash-confirm">I agree to pay at theatre counter before showtime</label>
                </div>
              </div>
            )}

            <button
              className={styles.payButton}
              onClick={handlePay}
              disabled={(method === "cash" && !cashConfirmed) || (method === "upi" && isPayingWithApp)}
            >
              {method === "cash"
                ? `Reserve Seats — ₹${total.toFixed(2)}`
                : method === "upi" && qrPaid
                ? `✓ Confirmed Paid — Complete Booking (₹${total.toFixed(2)})`
                : `Pay ₹${total.toFixed(2)} Securely`}
            </button>
          </div>

          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>🎟️ Order Summary</h3>
            <div className={styles.summaryMovieInfo}>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "4px", color: "#fff" }}>{movie.title}</h4>
              <p style={{ color: "#aaa", fontSize: "0.82rem", marginBottom: "12px" }}>
                <span>📅 {showDate}</span> • <span>⏱ {showTime}</span>
              </p>

              {/* Seats pills with category badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {seats.map(s => {
                  const prem = isPremiumSeat(s);
                  return (
                    <span
                      key={s}
                      style={{
                        background: prem ? "rgba(245, 158, 11, 0.15)" : "rgba(56, 189, 248, 0.15)",
                        border: `1px solid ${prem ? "rgba(245, 158, 11, 0.4)" : "rgba(56, 189, 248, 0.35)"}`,
                        color: prem ? "#fbbf24" : "#38bdf8",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      {prem ? "👑" : "🎬"} {s} (₹{prem ? PREMIUM_PRICE : STANDARD_PRICE})
                    </span>
                  );
                })}
              </div>

              {/* Itemized pricing breakdown */}
              <div style={{ borderTop: "1px dashed rgba(255, 255, 255, 0.1)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem" }}>
                {premiumSeats.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#fbbf24" }}>
                    <span>👑 Premium ({premiumSeats.length} × ₹{PREMIUM_PRICE})</span>
                    <span>₹{premiumTotal.toFixed(2)}</span>
                  </div>
                )}
                {standardSeats.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#38bdf8" }}>
                    <span>🎬 Standard ({standardSeats.length} × ₹{STANDARD_PRICE})</span>
                    <span>₹{standardTotal.toFixed(2)}</span>
                  </div>
                )}
                {snacksList.length > 0 && (
                  <div style={{ borderTop: "1px dashed rgba(255, 255, 255, 0.1)", paddingTop: "8px", marginTop: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#fbbf24", fontWeight: 700, marginBottom: "6px" }}>
                      <span>🍿 Food &amp; Snacks ({snacksList.reduce((acc, s) => acc + s.quantity, 0)})</span>
                      <span>₹{foodTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "4px" }}>
                      {snacksList.map(item => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#bbb" }}>
                          <span>{item.emoji} {item.name} × {item.quantity}</span>
                          <span>₹{(item.total || item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", borderTop: "1px dashed rgba(255, 255, 255, 0.1)", paddingTop: "8px" }}>
                  <span>Convenience Fee</span>
                  <span>₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontWeight: 700, fontSize: "1.05rem", borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "10px", marginTop: "4px" }}>
                  <span>Grand Total</span>
                  <span style={{ color: "#00e676" }}>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {processing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingContent}>
            <p className={styles.processingText}>Processing payment...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading Payment...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}