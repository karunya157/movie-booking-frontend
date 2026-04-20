"use client";

import React, { useState, useEffect } from "react";
import styles from "./bookings.module.css";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Booking {
  id: string;
  movieTitle: string;
  date: string;
  time: string;
  seats: string[];
  amount: number;
  status: string;
  image: string;
}

const BookingsPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/bookings?userId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Fetch Bookings Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleCancelTicket = (bookingId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this ticket? This action cannot be undone."
    );
    if (confirmed) {
      // In a real app, you'd call an API here. For now, we update local state.
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Cancelled" } : b
        )
      );
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

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Bookings</h1>
        <Link href="/movies" className={styles.bookMoreBtn}>+ Book New Movie</Link>
      </header>

      {loading ? (
        <div style={{ color: "white", textAlign: "center", padding: "40px" }}>Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className={styles.noBookings}>
          <p>You haven't booked any tickets yet.</p>
          <Link href="/movies">
             <button className={styles.detailBtn}>Browse Movies</button>
          </Link>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
          <div key={booking.id} className={styles.bookingCard}>
            <div className={styles.movieImg}>
              <img src={booking.image} alt={booking.movieTitle} />
            </div>
            <div className={styles.bookingDetails}>
              <div className={styles.mainInfo}>
                <h3>{booking.movieTitle}</h3>
                <span className={`${styles.status} ${styles[booking.status.toLowerCase()]}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.label}>Order ID</span>
                  <span className={styles.value}>#{booking.id}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.label}>Date & Time</span>
                  <span className={styles.value}>{booking.date} at {booking.time}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.label}>Seats</span>
                  <span className={styles.value}>{booking.seats.join(", ")}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.label}>Total Amount</span>
                  <span className={styles.value}>${booking.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              {booking.status === "Confirmed" && (
                <button
                  className={styles.cancelBtn}
                  onClick={() => handleCancelTicket(booking.id)}
                >
                  Cancel Ticket
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
        ))}
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceBooking && (
        <div className={styles.modalOverlay} onClick={handleCloseInvoice}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseInvoice}>✕</button>
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
                <span>{invoiceBooking.movieTitle}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Date & Time</span>
                <span>{invoiceBooking.date} at {invoiceBooking.time}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Seats</span>
                <span>{invoiceBooking.seats.join(", ")}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Status</span>
                <span className={`${styles.status} ${styles[invoiceBooking.status.toLowerCase()]}`}>
                  {invoiceBooking.status}
                </span>
              </div>
              <hr className={styles.invoiceDivider} />
              <div className={`${styles.invoiceRow} ${styles.invoiceTotal}`}>
                <span>Total Amount</span>
                <span>${invoiceBooking.amount.toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.invoiceActions}>
              <button className={styles.printBtn} onClick={handlePrintInvoice}>🖨 Print Invoice</button>
              <button className={styles.closeBtn} onClick={handleCloseInvoice}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
