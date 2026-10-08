"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import toast from "react-hot-toast";
import styles from "./seats.module.css";
import { defaultMoviesList } from "@/data/movies";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const seatsPerRow = 12; 

const PREMIUM_ROWS = ["A", "B", "C", "D"];
const STANDARD_ROWS = ["E", "F", "G", "H", "I", "J"];
const PREMIUM_PRICE = 300;
const STANDARD_PRICE = 180;

const isPremium = (seatId: string) => PREMIUM_ROWS.includes(seatId.charAt(0).toUpperCase());

export interface FoodItem {
  id: string;
  name: string;
  category: "popcorn" | "combos" | "beverages" | "snacks";
  price: number;
  description: string;
  emoji: string;
  isVeg: boolean;
}

export const FOOD_MENU: FoodItem[] = [
  {
    id: "f1",
    name: "Large Cheese Popcorn",
    category: "popcorn",
    price: 220,
    description: "Warm, freshly popped corn tossed in rich gourmet cheddar cheese seasoning",
    emoji: "🍿",
    isVeg: true,
  },
  {
    id: "f2",
    name: "Caramel Jumbo Popcorn",
    category: "popcorn",
    price: 240,
    description: "Crunchy golden popcorn generously coated with sweet buttery caramel",
    emoji: "🍿",
    isVeg: true,
  },
  {
    id: "f3",
    name: "Classic Salted Popcorn",
    category: "popcorn",
    price: 180,
    description: "Traditional cinema style light & crispy salted warm popcorn",
    emoji: "🍿",
    isVeg: true,
  },
  {
    id: "f4",
    name: "Blockbuster Duo Combo",
    category: "combos",
    price: 390,
    description: "1 Large Cheese Popcorn + 2 Chilled Cokes (Save ₹70)",
    emoji: "🍱",
    isVeg: true,
  },
  {
    id: "f5",
    name: "Family Mega Feast Combo",
    category: "combos",
    price: 540,
    description: "1 Cheese Popcorn + 1 Caramel Popcorn + 1 Loaded Nachos + 2 Drinks",
    emoji: "🍱",
    isVeg: true,
  },
  {
    id: "f6",
    name: "Chilled Coca-Cola (500ml)",
    category: "beverages",
    price: 110,
    description: "Ice-cold refreshing carbonated beverage served in jumbo cup",
    emoji: "🥤",
    isVeg: true,
  },
  {
    id: "f7",
    name: "Sprite Lemon Cooler (500ml)",
    category: "beverages",
    price: 110,
    description: "Zesty, crisp and sparkling lemon-lime refreshment",
    emoji: "🥤",
    isVeg: true,
  },
  {
    id: "f8",
    name: "Cold Coffee with Ice Cream",
    category: "beverages",
    price: 150,
    description: "Rich brewed iced espresso topped with vanilla ice cream",
    emoji: "☕",
    isVeg: true,
  },
  {
    id: "f9",
    name: "Loaded Mexican Nachos",
    category: "snacks",
    price: 200,
    description: "Crispy salted tortilla chips with hot melted cheese dip & spicy salsa",
    emoji: "🧀",
    isVeg: true,
  },
  {
    id: "f10",
    name: "Crispy Veg Supreme Burger",
    category: "snacks",
    price: 170,
    description: "Crunchy spiced patty with crisp lettuce, tomato & tangy mayo",
    emoji: "🍔",
    isVeg: true,
  },
  {
    id: "f11",
    name: "Smoky Chicken Fillet Burger",
    category: "snacks",
    price: 210,
    description: "Juicy golden fried chicken patty with smoked barbecue dressing",
    emoji: "🍗",
    isVeg: false,
  },
  {
    id: "f12",
    name: "Peri-Peri French Fries",
    category: "snacks",
    price: 140,
    description: "Deep-fried golden potato fingers with fiery peri-peri seasoning",
    emoji: "🍟",
    isVeg: true,
  },
];

function SeatsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const movieId = Number(searchParams.get("movie") || 2);
  const initialMovie = defaultMoviesList.find((m) => m.id === movieId);
  const [movieTitle, setMovieTitle] = useState<string>(
    initialMovie?.title || "Movie"
  );

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let currentUser = user;
    if (!currentUser && storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {}
    }
    if (!currentUser) {
      toast.error("Please login to select seats & book tickets!");
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

  useEffect(() => {
    // Dynamically fetch movie details from backend to ensure 100% accuracy
    const fetchMovieData = async () => {
      try {
        const res = await fetch("/api/movies");
        if (res.ok) {
          const movies = await res.json();
          const current = movies.find((m: { id: number; title: string }) => m.id === movieId);
          if (current) {
            setMovieTitle(current.title);
          }
        }
      } catch (err) {
        console.error("Failed to load movie title:", err);
      }
    };
    fetchMovieData();
  }, [movieId]);

  const theatre = searchParams.get("theatre") || "PVR: Sathyam Cinemas, Chennai";
  const date = searchParams.get("date") || "2026-04-20";
  const time = searchParams.get("time") || "19:30";

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);

  // 🍿 Food & Beverages State
  const [selectedFood, setSelectedFood] = useState<Record<string, number>>({});
  const [activeFoodCategory, setActiveFoodCategory] = useState<string>("all");

  const handleAddFood = (foodId: string) => {
    setSelectedFood(prev => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));
  };

  const handleRemoveFood = (foodId: string) => {
    setSelectedFood(prev => {
      const next = { ...prev };
      if (next[foodId] > 1) {
        next[foodId] -= 1;
      } else {
        delete next[foodId];
      }
      return next;
    });
  };

  const handleClearFoodItem = (foodId: string) => {
    setSelectedFood(prev => {
      const next = { ...prev };
      delete next[foodId];
      return next;
    });
  };

  const foodTotal = Object.entries(selectedFood).reduce((sum, [id, qty]) => {
    const item = FOOD_MENU.find(f => f.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const totalSnacksCount = Object.values(selectedFood).reduce((a, b) => a + b, 0);

  const filteredFoodMenu = activeFoodCategory === "all"
    ? FOOD_MENU
    : FOOD_MENU.filter(f => f.category === activeFoodCategory);

  useEffect(() => {
    const occupied: string[] = [];
    rows.forEach(r => {
      for(let i=1; i<=seatsPerRow; i++) {
        if(Math.random() < 0.25) { 
          occupied.push(`${r}${i}`);
        }
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const premiumSelected = selectedSeats.filter(isPremium);
  const standardSelected = selectedSeats.filter(s => !isPremium(s));
  const premiumTotal = premiumSelected.length * PREMIUM_PRICE;
  const standardTotal = standardSelected.length * STANDARD_PRICE;
  const subtotal = premiumTotal + standardTotal;
  const grandTotal = subtotal + foodTotal;

  const handleProceed = () => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let currentUser = user;
    if (!currentUser && storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {}
    }
    if (!currentUser) {
      toast.error("Please login to proceed with booking!");
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
    if (selectedSeats.length === 0) return;
    const seatsStr = selectedSeats.join(",");

    const snacksArray = Object.entries(selectedFood).map(([id, qty]) => {
      const item = FOOD_MENU.find(f => f.id === id)!;
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
        emoji: item.emoji,
        total: item.price * qty,
      };
    });

    const snacksJson = JSON.stringify(snacksArray);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("movie_booking_snacks", snacksJson);
    }

    const encodedSnacks = encodeURIComponent(snacksJson);
    router.push(
      `/payment?movie=${movieId}&theatre=${encodeURIComponent(theatre)}&date=${date}&time=${encodeURIComponent(time)}&seats=${seatsStr}&seatsTotal=${subtotal}&foodTotal=${foodTotal}&subtotal=${grandTotal}&snacks=${encodedSnacks}`
    );
  };

  const renderRow = (rowLabel: string) => {
    const isRowPremium = PREMIUM_ROWS.includes(rowLabel);
    const seatPrice = isRowPremium ? PREMIUM_PRICE : STANDARD_PRICE;
    const seats = [];

    for (let i = 1; i <= seatsPerRow; i++) {
      const seatId = `${rowLabel}${i}`;
      const isOccupied = occupiedSeats.includes(seatId);
      const isSelected = selectedSeats.includes(seatId);

      seats.push(
        <button
          key={seatId}
          className={`${styles.seat} ${isRowPremium ? styles.premium : styles.standard} ${isOccupied ? styles.occupied : ''} ${isSelected ? `${styles.selected} ${isRowPremium ? styles.premium : styles.standard}` : ''}`}
          onClick={() => toggleSeat(seatId)}
          title={isOccupied ? "Occupied" : `Seat ${seatId} • ${isRowPremium ? "👑 Premium" : "🎬 Standard"} (₹${seatPrice})`}
        >
          {i}
        </button>
      );

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
              <div className={styles.seatCategoryPremium}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👑 PREMIUM CLASS</span>
                  <span className={styles.categoryTag}>Rows A–D • Prime View & Sound</span>
                </div>
                <span className={styles.pricePill}>₹{PREMIUM_PRICE}</span>
              </div>
              {PREMIUM_ROWS.map(r => renderRow(r))}
              
              <div className={styles.seatCategoryStandard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎬 STANDARD CLASS</span>
                  <span className={styles.categoryTag}>Rows E–J • Classic Cinema Comfort</span>
                </div>
                <span className={styles.pricePill}>₹{STANDARD_PRICE}</span>
              </div>
              {STANDARD_ROWS.map(r => renderRow(r))}
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.premiumAvailable}`}></div>
                <span>Premium (₹{PREMIUM_PRICE})</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.standardAvailable}`}></div>
                <span>Standard (₹{STANDARD_PRICE})</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.premiumSelected}`}></div>
                <span>Selected Premium</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.standardSelected}`}></div>
                <span>Selected Standard</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.occupied}`}></div>
                <span>Occupied</span>
              </div>
            </div>

            {/* 🍿 Food & Beverages (F&B) Pre-order Section */}
            <div className={styles.foodSection}>
              <div className={styles.foodHeader}>
                <div>
                  <div className={styles.foodHeaderTitle}>
                    <span>🍿 Grab a Bite • Food & Beverages</span>
                  </div>
                  <div className={styles.foodHeaderSubtitle}>
                    Pre-order fresh cinema snacks & drinks. Delivered to your seat or ready at pickup counter!
                  </div>
                </div>
                <div className={styles.foodSkipBadge}>
                  ⚡ 0 Waiting Time • Seat Delivery
                </div>
              </div>

              {/* Category Tabs */}
              <div className={styles.foodTabs}>
                {[
                  { id: "all", label: "✨ All Items (12)" },
                  { id: "combos", label: "🍱 Combos" },
                  { id: "popcorn", label: "🍿 Popcorn" },
                  { id: "beverages", label: "🥤 Beverages" },
                  { id: "snacks", label: "🍟 Quick Bites" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.foodTab} ${activeFoodCategory === tab.id ? styles.activeTab : ""}`}
                    onClick={() => setActiveFoodCategory(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Food Items Grid */}
              <div className={styles.foodGrid}>
                {filteredFoodMenu.map(item => {
                  const qty = selectedFood[item.id] || 0;
                  return (
                    <div key={item.id} className={`${styles.foodCard} ${qty > 0 ? styles.foodCardSelected : ""}`}>
                      <div>
                        <div className={styles.foodCardTop}>
                          <div className={styles.foodEmoji}>{item.emoji}</div>
                          <div
                            className={`${styles.dietTag} ${item.isVeg ? styles.veg : styles.nonVeg}`}
                            title={item.isVeg ? "100% Vegetarian" : "Non-Vegetarian"}
                          >
                            <div className={item.isVeg ? styles.dietDotVeg : styles.dietDotNonVeg}></div>
                          </div>
                        </div>
                        <div className={styles.foodCardBody}>
                          <div className={styles.foodName}>{item.name}</div>
                          <div className={styles.foodDesc}>{item.description}</div>
                          <div className={styles.foodPrice}>₹{item.price}</div>
                        </div>
                      </div>

                      <div className={styles.foodActions}>
                        {qty === 0 ? (
                          <button
                            type="button"
                            className={styles.foodAddBtn}
                            onClick={() => handleAddFood(item.id)}
                          >
                            + Add
                          </button>
                        ) : (
                          <div className={styles.qtyControl}>
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => handleRemoveFood(item.id)}
                            >
                              −
                            </button>
                            <span className={styles.qtyValue}>{qty}</span>
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => handleAddFood(item.id)}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right panel: Summary */}
          <div className={styles.summarySection}>
            <h2 className={styles.summaryTitle}>Booking Summary</h2>
            
            {selectedSeats.length > 0 ? (
              <>
                <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Selected Seats ({selectedSeats.length})</span>
                  <button 
                    onClick={() => setSelectedSeats([])}
                    style={{ background: 'none', border: 'none', color: '#e50914', cursor: 'pointer', fontSize: '0.78rem' }}
                  >
                    Clear All
                  </button>
                </div>
                <div className={styles.selectedSeatsList}>
                  {selectedSeats.map(s => {
                    const prem = isPremium(s);
                    return (
                      <span 
                        key={s} 
                        className={prem ? styles.seatBadgePremium : styles.seatBadgeStandard}
                        onClick={() => toggleSeat(s)}
                        title="Click to remove seat"
                        style={{ cursor: 'pointer' }}
                      >
                        {prem ? "👑" : "🎬"} {s} <span style={{ opacity: 0.75, fontSize: '0.72rem' }}>₹{prem ? PREMIUM_PRICE : STANDARD_PRICE}</span> ×
                      </span>
                    );
                  })}
                </div>
                
                {premiumSelected.length > 0 && (
                  <div className={styles.priceRow}>
                    <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      👑 Premium ({premiumSelected.length} × ₹{PREMIUM_PRICE})
                    </span>
                    <span style={{ color: '#fbbf24', fontWeight: '600' }}>₹{premiumTotal.toFixed(2)}</span>
                  </div>
                )}

                {standardSelected.length > 0 && (
                  <div className={styles.priceRow}>
                    <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🎬 Standard ({standardSelected.length} × ₹{STANDARD_PRICE})
                    </span>
                    <span style={{ color: '#38bdf8', fontWeight: '600' }}>₹{standardTotal.toFixed(2)}</span>
                  </div>
                )}
                
                <div className={styles.priceRow} style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                  <span>Seats Subtotal</span>
                  <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
                </div>

                {/* 🍿 Snacks in Booking Summary */}
                {totalSnacksCount > 0 && (
                  <div className={styles.foodSummarySection}>
                    <div className={styles.foodSummaryTitle}>
                      <span>🍿 Food & Drinks ({totalSnacksCount})</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFood({})}
                        style={{ background: 'none', border: 'none', color: '#e50914', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className={styles.foodSummaryList}>
                      {Object.entries(selectedFood).map(([foodId, qty]) => {
                        const item = FOOD_MENU.find(f => f.id === foodId);
                        if (!item) return null;
                        return (
                          <div key={foodId} className={styles.foodSummaryItem}>
                            <div className={styles.foodSummaryItemName}>
                              <span>{item.emoji}</span>
                              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name} × {qty}</span>
                            </div>
                            <div className={styles.foodSummaryItemPrice}>
                              <span>₹{(item.price * qty).toFixed(2)}</span>
                              <button
                                type="button"
                                className={styles.foodRemoveBtn}
                                onClick={() => handleClearFoodItem(foodId)}
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.priceRow}>
                      <span style={{ color: '#fbbf24' }}>🍿 Snacks Subtotal</span>
                      <span style={{ color: '#fbbf24', fontWeight: '600' }}>₹{foodTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                <div className={styles.priceTotal}>
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
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
              {selectedSeats.length === 0 
                ? "Select Seats to Proceed" 
                : `Proceed to Payment • ₹${grandTotal.toFixed(2)}`}
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
