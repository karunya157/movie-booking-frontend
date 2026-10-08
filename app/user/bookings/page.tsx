"use client";
import toast from 'react-hot-toast';

import React, { useState, useEffect } from "react";
import styles from "./bookings.module.css";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Booking {
  id: string | number;
  movieTitle?: string;
  movie_title?: string;
  date?: string;
  time?: string;
  seats?: string[] | string;
  amount?: number;
  total_amount?: number;
  status?: string;
  image?: string;
  method?: string;
  snacks?: { id: string; name: string; quantity: number; emoji?: string; total?: number; price?: number }[];
  foodTotal?: number;
  seatsTotal?: number;
}

const BookingsPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);

  // Refund & Cancellation Modal States
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [refundSuccessBooking, setRefundSuccessBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Fallback to userId = 1 if user is not logged in
        const currentUserId = user?.id || 1;

        const res = await fetch(`/api/bookings?userId=${encodeURIComponent(String(currentUserId))}`, {
          cache: "no-store",
        });
        
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.bookings || [];
          const sorted = [...list].sort((a: any, b: any) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });
          setBookings(sorted);
        }
      } catch (error) {
        console.error("Fetch Bookings Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const confirmCancelTicket = async () => {
    if (!cancelModalBooking) return;
    setIsCancelling(true);
    const bookingId = cancelModalBooking.id;
    const refundAmt = getAmount(cancelModalBooking);

    try {
      const res = await fetch(`/api/bookings?id=${encodeURIComponent(String(bookingId))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled (Refunded)" }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "Cancelled (Refunded)" } : b
          )
        );
        const breakdown = getBreakdown(cancelModalBooking);
        if (breakdown.foodCost > 0) {
          toast.success(`₹${refundAmt} Full Refund (Tickets ₹${breakdown.seatsCost.toFixed(2)} + Food ₹${breakdown.foodCost.toFixed(2)}) initiated successfully! 💸`, { duration: 5000 });
        } else {
          toast.success(`₹${refundAmt} Full Refund initiated successfully to your original payment method! 💸`, { duration: 4000 });
        }
        setRefundSuccessBooking(cancelModalBooking);
        setTimeout(() => {
          setCancelModalBooking(null);
          setRefundSuccessBooking(null);
          setIsCancelling(false);
        }, 2200);
      } else {
        toast.error("Failed to cancel ticket. Please try again.");
        setIsCancelling(false);
      }
    } catch (error) {
      console.error("Cancel Ticket Error:", error);
      toast.error("An error occurred while cancelling the ticket.");
      setIsCancelling(false);
    }
  };

  const handleViewInvoice = (booking: Booking) => {
    setInvoiceBooking(booking);
  };

  const handleCloseInvoice = () => {
    setInvoiceBooking(null);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Helper functions for safe rendering
  const getTitle = (b: Booking) => b.movieTitle || b.movie_title || "Movie";
  const getAmount = (b: Booking) => Number(b.amount || b.total_amount || 0).toFixed(2);
  const getSeats = (b: Booking) => {
    if (Array.isArray(b.seats)) return b.seats.join(", ");
    if (typeof b.seats === "string") return b.seats;
    return "N/A";
  };
  const getStatus = (b: Booking) => b.status || "Confirmed";

  const PREMIUM_ROWS = ["A", "B", "C", "D"];
  const PREMIUM_PRICE = 300;
  const STANDARD_PRICE = 180;
  const CONVENIENCE_FEE = 49;

  const getBreakdown = (b: Booking) => {
    const total = Number(b.amount || b.total_amount || 0);
    const seatsStr = Array.isArray(b.seats) ? b.seats.join(",") : (b.seats || "");
    const seatList = seatsStr.split(",").map(s => s.trim()).filter(Boolean);
    
    if (b.foodTotal && Number(b.foodTotal) > 0) {
      const food = Number(b.foodTotal);
      const seatsPortion = Math.max(0, total - food);
      return {
        seatsCost: seatsPortion,
        foodCost: food,
        total,
        seatCount: seatList.length,
      };
    }

    if (b.snacks && Array.isArray(b.snacks) && b.snacks.length > 0) {
      const food = b.snacks.reduce((acc, s) => acc + (s.total || (s.price || 0) * (s.quantity || 1)), 0);
      const seatsPortion = Math.max(0, total - food);
      return {
        seatsCost: seatsPortion,
        foodCost: food,
        total,
        seatCount: seatList.length,
      };
    }

    let seatSum = 0;
    if (seatList.length > 0) {
      seatList.forEach(s => {
        const row = s.charAt(0).toUpperCase();
        seatSum += PREMIUM_ROWS.includes(row) ? PREMIUM_PRICE : STANDARD_PRICE;
      });
      seatSum += CONVENIENCE_FEE;
    } else {
      seatSum = total;
    }

    const foodCost = Math.max(0, total - seatSum);
    const seatsCost = total - foodCost;

    return {
      seatsCost,
      foodCost,
      total,
      seatCount: seatList.length,
    };
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Bookings</h1>
        <Link href="/movies" className={styles.bookMoreBtn}>
          + Book New Movie
        </Link>
      </header>

      {loading ? (
        <div style={{ color: "white", textAlign: "center", padding: "40px" }}>
          Loading your bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles.noBookings}>
          <p>You haven&apos;t booked any tickets yet.</p>
          <Link href="/movies">
            <button className={styles.detailBtn}>Browse Movies</button>
          </Link>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => {
            const status = getStatus(booking);
            return (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.movieImg}>
                  <img src={booking.image || "/leo.jpg"} alt={getTitle(booking)} />
                </div>
                <div className={styles.bookingDetails}>
                  <div className={styles.mainInfo}>
                    <h3>{getTitle(booking)}</h3>
                    <span className={`${styles.status} ${status.toLowerCase().includes("refund") ? styles.refundedBadge : (styles[status.toLowerCase()] || "")}`}>
                      {status}
                    </span>
                  </div>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.label}>Order ID</span>
                      <span className={styles.value}>#{booking.id}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.label}>Date & Time</span>
                      <span className={styles.value}>
                        {booking.date || "N/A"} at {booking.time || "N/A"}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.label}>Seats</span>
                      <span className={styles.value}>{getSeats(booking)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.label}>Total Amount</span>
                      <span className={styles.value}>₹{getAmount(booking)}</span>
                    </div>
                    {(() => {
                      const bBreak = getBreakdown(booking);
                      if (bBreak.foodCost > 0) {
                        return (
                          <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
                            <span className={styles.label}>🍿 Food &amp; Snacks Included</span>
                            <span className={styles.value} style={{ color: "#fbbf24", fontSize: "0.85rem" }}>
                              {booking.snacks && Array.isArray(booking.snacks) && booking.snacks.length > 0
                                ? booking.snacks.map((s: { emoji?: string; name: string; quantity: number }) => `${s.emoji || '🍿'} ${s.name} × ${s.quantity}`).join(", ")
                                : `Pre-ordered Cinema Snacks & Beverages (+₹${bBreak.foodCost.toFixed(2)})`}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {status.toLowerCase().includes("refund") && (
                      <div className={styles.metaItem}>
                        <span className={styles.label}>Refund Status</span>
                        <span className={styles.value} style={{ color: "#00e676", fontWeight: 600 }}>
                          ✓ ₹{getAmount(booking)} Credited
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.actions}>
                  {(status === "Confirmed" || status === "Reserved") && (
                    <button
                      className={styles.cancelBtn}
                      onClick={() => setCancelModalBooking(booking)}
                    >
                      Cancel & Refund
                    </button>
                  )}
                  <button
                    className={styles.detailBtn}
                    onClick={() => handleViewInvoice(booking)}
                  >
                    View Invoice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceBooking && (
        <div className={styles.modalOverlay} onClick={handleCloseInvoice}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseInvoice}>
              ✕
            </button>
            <div className={styles.invoiceHeader}>
              <h2>🎬 MovieTicket</h2>
              <p className={styles.invoiceLabel}>INVOICE</p>
            </div>
            <hr className={styles.invoiceDivider} />
            <div className={styles.invoiceBody}>
              <div className={styles.invoiceRow}>
                <span>Invoice ID</span>
                <span>INV-{invoiceBooking.id}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Movie</span>
                <span>{getTitle(invoiceBooking)}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Date & Time</span>
                <span>
                  {invoiceBooking.date} at {invoiceBooking.time}
                </span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Seats</span>
                <span>{getSeats(invoiceBooking)}</span>
              </div>
              {invoiceBooking.snacks && Array.isArray(invoiceBooking.snacks) && invoiceBooking.snacks.length > 0 && (
                <div className={styles.invoiceRow} style={{ alignItems: "flex-start" }}>
                  <span>🍿 Food &amp; Snacks</span>
                  <div style={{ textAlign: "right" }}>
                    {invoiceBooking.snacks.map((s: { emoji?: string; name: string; quantity: number }, idx: number) => (
                      <div key={idx} style={{ fontSize: "0.82rem", color: "#fbbf24" }}>
                        {s.emoji || '🍿'} {s.name} × {s.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.invoiceRow}>
                <span>Status</span>
                <span className={`${styles.status} ${styles[getStatus(invoiceBooking).toLowerCase()] || ""}`}>
                  {getStatus(invoiceBooking)}
                </span>
              </div>
              <hr className={styles.invoiceDivider} />
              <div className={`${styles.invoiceRow} ${styles.invoiceTotal}`}>
                <span>Total Amount</span>
                <span>₹{getAmount(invoiceBooking)}</span>
              </div>
            </div>
            <div className={styles.invoiceActions}>
              <button className={styles.printBtn} onClick={handlePrintInvoice}>
                🖨 Print Invoice
              </button>
              <button className={styles.closeBtn} onClick={handleCloseInvoice}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation & Refund Modal */}
      {cancelModalBooking && (
        <div className={styles.modalOverlay} onClick={() => !isCancelling && setCancelModalBooking(null)}>
          <div className={styles.refundModalContent} onClick={(e) => e.stopPropagation()}>
            {!isCancelling && (
              <button
                className={styles.modalClose}
                onClick={() => setCancelModalBooking(null)}
              >
                ✕
              </button>
            )}

            {cancelModalBooking && (() => {
              const bBreakdown = getBreakdown(cancelModalBooking);
              return refundSuccessBooking ? (
                <div className={styles.refundSuccessCard}>
                  <div className={styles.refundSuccessIcon}>🎉</div>
                  <h3>Refund Initiated Successfully!</h3>
                  <p>
                    ₹{getAmount(refundSuccessBooking)} (including {bBreakdown.foodCost > 0 ? "Seats and Food & Snacks" : "Seats"}) will be credited back to your original payment method ({refundSuccessBooking.method ? refundSuccessBooking.method.toUpperCase() : "UPI / Card"}) within 1-2 hours.
                  </p>
                  <div style={{ color: "#00e676", fontWeight: 700, fontSize: "1.1rem" }}>
                    ✓ Booking #{refundSuccessBooking.id} Cancelled
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.refundHeader}>
                    <div className={styles.refundIcon}>💸</div>
                    <h2 className={styles.refundTitle}>Cancel Ticket & Refund</h2>
                    <p className={styles.refundSubtitle}>
                      Your ticket and pre-ordered food will be cancelled and a full 100% refund will be processed back to your source account.
                    </p>
                  </div>

                  <div className={styles.refundSummaryCard}>
                    <div className={styles.refundSummaryRow}>
                      <span className={styles.refundSummaryLabel}>Movie</span>
                      <span className={styles.refundSummaryValue}>{getTitle(cancelModalBooking)}</span>
                    </div>
                    <div className={styles.refundSummaryRow}>
                      <span className={styles.refundSummaryLabel}>Booking ID</span>
                      <span className={styles.refundSummaryValue}>#{cancelModalBooking.id}</span>
                    </div>
                    <div className={styles.refundSummaryRow}>
                      <span className={styles.refundSummaryLabel}>Date & Time</span>
                      <span className={styles.refundSummaryValue}>
                        {cancelModalBooking.date} at {cancelModalBooking.time}
                      </span>
                    </div>
                    <div className={styles.refundSummaryRow}>
                      <span className={styles.refundSummaryLabel}>Seats ({bBreakdown.seatCount})</span>
                      <span className={styles.refundSummaryValue}>
                        {getSeats(cancelModalBooking)} {bBreakdown.foodCost > 0 && <span style={{ opacity: 0.85, fontSize: "0.82rem", color: "#38bdf8" }}>(₹{bBreakdown.seatsCost.toFixed(2)})</span>}
                      </span>
                    </div>

                    {/* 🍿 Food & Snacks 100% Refund Breakdown */}
                    {bBreakdown.foodCost > 0 && (
                      <div className={styles.refundSummaryRow} style={{ background: "rgba(251, 191, 36, 0.08)", padding: "10px 12px", borderRadius: "8px", margin: "6px 0", border: "1px dashed rgba(251, 191, 36, 0.3)" }}>
                        <span className={styles.refundSummaryLabel} style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                          🍿 Food &amp; Snacks Refund
                        </span>
                        <span className={styles.refundSummaryValue} style={{ color: "#fbbf24", fontWeight: 800 }}>
                          + ₹{bBreakdown.foodCost.toFixed(2)} (100% Refunded)
                        </span>
                      </div>
                    )}

                    {cancelModalBooking.snacks && Array.isArray(cancelModalBooking.snacks) && cancelModalBooking.snacks.length > 0 && (
                      <div style={{ fontSize: "0.78rem", color: "#bbb", margin: "-2px 0 6px 12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {cancelModalBooking.snacks.map((s, idx) => (
                          <span key={idx} style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px" }}>
                            {s.emoji || "🍿"} {s.name} × {s.quantity}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.refundSummaryRow}>
                      <span className={styles.refundSummaryLabel}>Cancellation Fee</span>
                      <span className={styles.refundSummaryValue} style={{ color: "#00e676" }}>
                        ₹0.00 (Free Cancellation)
                      </span>
                    </div>
                  </div>

                  <div className={styles.refundHighlightBox}>
                    <div className={styles.refundHighlightText}>
                      <h4>Total Refund Amount</h4>
                      {bBreakdown.foodCost > 0 ? (
                        <p style={{ color: "#a3e635", fontSize: "0.8rem", fontWeight: 600 }}>
                          ✓ Tickets (₹{bBreakdown.seatsCost.toFixed(2)}) + Food &amp; Snacks (₹{bBreakdown.foodCost.toFixed(2)})
                        </p>
                      ) : (
                        <p>Direct credit to {cancelModalBooking.method ? cancelModalBooking.method.toUpperCase() : "UPI / Card"}</p>
                      )}
                    </div>
                    <div className={styles.refundHighlightAmount}>
                      ₹{getAmount(cancelModalBooking)}
                    </div>
                  </div>

                  <div className={styles.refundGuarantee}>
                    <span>🛡️</span>
                    <div>
                      <strong>100% Full Refund Guarantee</strong>: No deduction made. Both your Movie Ticket ({getSeats(cancelModalBooking)}) {bBreakdown.foodCost > 0 ? `and Food & Snacks (₹${bBreakdown.foodCost.toFixed(2)})` : ``} are 100% refunded back to your original payment source.
                    </div>
                  </div>

                  <div className={styles.refundActions}>
                    <button
                      className={styles.keepTicketBtn}
                      onClick={() => setCancelModalBooking(null)}
                      disabled={isCancelling}
                    >
                      Keep Ticket
                    </button>
                    <button
                      className={styles.confirmCancelBtn}
                      onClick={confirmCancelTicket}
                      disabled={isCancelling}
                    >
                      {isCancelling
                        ? "Processing Refund..."
                        : bBreakdown.foodCost > 0
                        ? `Confirm & Refund ₹${getAmount(cancelModalBooking)} (Tickets + Food)`
                        : `Confirm & Refund ₹${getAmount(cancelModalBooking)}`}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;