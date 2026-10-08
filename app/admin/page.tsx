"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slice/authSlice";
import toast from "react-hot-toast";
import styles from "./admin.module.css";
import { defaultMoviesList, Movie } from "@/data/movies";

/* ===== Interfaces ===== */
interface Hall {
  id: string;
  name: string;
  screenType: string;
  capacity: number;
  rows?: number;
  seatsPerRow?: number;
  status: "Active" | "Inactive";
  movieAssigned: string | null;
  timings: string[];
  pricing?: {
    regular: number;
    premium: number;
    recliner: number;
    vip: number;
  };
}

interface Theatre {
  id: string;
  name: string;
  city: string;
  status: "Active" | "Inactive";
  area: string;
  numHalls: number;
  address: string;
  googleMaps: string;
  phone: string;
  email: string;
  facilities: string[];
  halls: Hall[];
}

// Modal Form State
interface MovieFormData {
  id: number | null;
  title: string;
  genre: string;
  status: string;
  language?: string;
  image?: string;
  duration?: string;
}

interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface ActivityItem {
  id?: string | number;
  text: string;
  time: string;
  amount?: number;
  status?: string;
}

function formatActivityTime(createdAt?: string): string {
  if (!createdAt) return "Just now";
  try {
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (diffSec < 60) {
      return `Just now (${timeStr})`;
    }
    if (diffMin < 60) {
      return `${diffMin} min${diffMin > 1 ? "s" : ""} ago (${timeStr})`;
    }

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Today, ${timeStr}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    }

    const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return "Recently";
  }
}

const ALL_FACILITIES = ["Parking", "Food Court", "AC", "WiFi", "Wheelchair Access"];
const SCREEN_TYPES = ["IMAX", "2D", "3D", "Dolby Atmos", "4DX", "RGB 4K Laser", "Barco Laser"];
const QUICK_TIMINGS = ["10:30 AM", "01:30 PM", "04:30 PM", "07:30 PM", "10:30 PM"];

const defaultTheatres: Theatre[] = [
  {
    id: "T1",
    name: "PVR: Sathyam Cinemas",
    city: "Chennai",
    status: "Active",
    area: "Royapettah",
    numHalls: 3,
    address: "8, Thiruvika Rd, Peters Colony, Royapettah, Chennai, Tamil Nadu 600014",
    googleMaps: "https://maps.google.com/?q=Sathyam+Cinemas+Royapettah+Chennai",
    phone: "+91 44 4392 0300",
    email: "sathyam@pvrcinemas.com",
    facilities: ["Parking", "Food Court", "AC", "WiFi", "Wheelchair Access"],
    halls: [
      {
        id: "H1",
        name: "Hall 1",
        screenType: "IMAX",
        capacity: 250,
        rows: 10,
        seatsPerRow: 16,
        status: "Active",
        movieAssigned: "Leo",
        timings: ["10:30 AM", "01:30 PM", "04:30 PM", "07:30 PM", "10:30 PM"],
        pricing: { regular: 150, premium: 200, recliner: 350, vip: 450 },
      },
      {
        id: "H2",
        name: "Hall 2",
        screenType: "2D",
        capacity: 180,
        rows: 10,
        seatsPerRow: 18,
        status: "Active",
        movieAssigned: "Viduthalai",
        timings: ["11:15 AM", "02:45 PM", "06:15 PM", "09:45 PM"],
        pricing: { regular: 130, premium: 180, recliner: 300, vip: 400 },
      },
      {
        id: "H3",
        name: "Hall 3",
        screenType: "Dolby Atmos",
        capacity: 220,
        rows: 11,
        seatsPerRow: 20,
        status: "Active",
        movieAssigned: "The Greatest of All Time (GOAT)",
        timings: ["10:00 AM", "01:45 PM", "05:30 PM", "09:15 PM"],
        pricing: { regular: 150, premium: 220, recliner: 350, vip: 450 },
      },
    ],
  },
  {
    id: "T2",
    name: "INOX City Centre",
    city: "Coimbatore",
    status: "Active",
    area: "Brookefields Mall, Dr Krishnasamy Mudaliar Rd",
    numHalls: 4,
    address: "Brookefields Mall, Dr Krishnasamy Mudaliar Rd, Coimbatore, Tamil Nadu 641001",
    googleMaps: "https://maps.google.com/?q=INOX+Brookefields+Coimbatore",
    phone: "+91 422 439 1234",
    email: "inox.coimbatore@inoxmovies.com",
    facilities: ["Parking", "Food Court", "AC", "WiFi"],
    halls: [
      {
        id: "H201",
        name: "Screen 1",
        screenType: "4DX",
        capacity: 160,
        rows: 10,
        seatsPerRow: 16,
        status: "Active",
        movieAssigned: "Manjummel Boys",
        timings: ["10:30 AM", "02:00 PM", "06:00 PM", "09:30 PM"],
        pricing: { regular: 200, premium: 280, recliner: 400, vip: 500 },
      },
      {
        id: "H202",
        name: "Screen 2",
        screenType: "Dolby Atmos",
        capacity: 200,
        rows: 10,
        seatsPerRow: 20,
        status: "Active",
        movieAssigned: "Pushpa 2: The Rule",
        timings: ["11:00 AM", "02:30 PM", "06:30 PM", "10:00 PM"],
        pricing: { regular: 150, premium: 200, recliner: 350, vip: 450 },
      },
      {
        id: "H203",
        name: "Screen 3",
        screenType: "RGB 4K Laser",
        capacity: 220,
        rows: 11,
        seatsPerRow: 20,
        status: "Active",
        movieAssigned: "Aavesham",
        timings: ["12:00 PM", "03:30 PM", "07:00 PM", "10:30 PM"],
        pricing: { regular: 160, premium: 220, recliner: 360, vip: 460 },
      },
      {
        id: "H204",
        name: "Screen 4",
        screenType: "2D",
        capacity: 150,
        rows: 10,
        seatsPerRow: 15,
        status: "Active",
        movieAssigned: "Kalki 2898 AD",
        timings: ["01:00 PM", "04:30 PM", "08:00 PM"],
        pricing: { regular: 140, premium: 190, recliner: 320, vip: 420 },
      },
    ],
  },
  {
    id: "T3",
    name: "AGS Cinemas",
    city: "Madurai",
    status: "Active",
    area: "Anna Nagar",
    numHalls: 3,
    address: "80 Feet Road, Anna Nagar, Madurai, Tamil Nadu 625020",
    googleMaps: "https://maps.google.com/?q=AGS+Cinemas+Madurai",
    phone: "+91 452 252 8899",
    email: "contact@agscinemas.com",
    facilities: ["Parking", "Food Court", "AC", "Wheelchair Access"],
    halls: [
      {
        id: "H301",
        name: "Screen 1",
        screenType: "Barco Laser",
        capacity: 240,
        rows: 12,
        seatsPerRow: 20,
        status: "Active",
        movieAssigned: "Amaran",
        timings: ["10:15 AM", "01:30 PM", "04:45 PM", "08:00 PM"],
        pricing: { regular: 150, premium: 200, recliner: 350, vip: 450 },
      },
      {
        id: "H302",
        name: "Screen 2",
        screenType: "Dolby 7.1",
        capacity: 190,
        rows: 10,
        seatsPerRow: 19,
        status: "Active",
        movieAssigned: "Jawan",
        timings: ["11:00 AM", "02:45 PM", "06:15 PM", "09:45 PM"],
        pricing: { regular: 130, premium: 180, recliner: 300, vip: 400 },
      },
      {
        id: "H303",
        name: "Screen 3",
        screenType: "2D",
        capacity: 170,
        rows: 10,
        seatsPerRow: 17,
        status: "Active",
        movieAssigned: "Devara: Part 1",
        timings: ["12:30 PM", "04:00 PM", "07:30 PM"],
        pricing: { regular: 130, premium: 180, recliner: 300, vip: 400 },
      },
    ],
  },
  {
    id: "T4",
    name: "Kasi Theatre",
    city: "Salem",
    status: "Inactive",
    area: "Jafferkhanpet / Old Bus Stand Area",
    numHalls: 2,
    address: "Main Road, Near Old Bus Stand, Salem, Tamil Nadu 636001",
    googleMaps: "https://maps.google.com/?q=Kasi+Theatre+Salem",
    phone: "+91 427 245 1122",
    email: "info@kasitheatre.com",
    facilities: ["Parking", "AC"],
    halls: [
      {
        id: "H401",
        name: "Main Screen",
        screenType: "2D",
        capacity: 210,
        rows: 10,
        seatsPerRow: 21,
        status: "Inactive",
        movieAssigned: null,
        timings: [],
        pricing: { regular: 120, premium: 160, recliner: 250, vip: 350 },
      },
      {
        id: "H402",
        name: "Screen 2",
        screenType: "Dolby Atmos",
        capacity: 180,
        rows: 10,
        seatsPerRow: 18,
        status: "Inactive",
        movieAssigned: null,
        timings: [],
        pricing: { regular: 130, premium: 170, recliner: 270, vip: 370 },
      },
    ],
  },
  {
    id: "T5",
    name: "SPI: Palazzo",
    city: "Chennai",
    status: "Active",
    area: "The Forum Vijaya Mall, Vadapalani",
    numHalls: 5,
    address: "Nexus Vijaya Mall, Arcot Rd, Vadapalani, Chennai, Tamil Nadu 600026",
    googleMaps: "https://maps.google.com/?q=Palazzo+Cinemas+Vadapalani",
    phone: "+91 44 4224 4224",
    email: "palazzo@spicinemas.in",
    facilities: ["Parking", "Food Court", "AC", "WiFi", "Wheelchair Access"],
    halls: [
      {
        id: "H501",
        name: "Palazzo Screen 1",
        screenType: "IMAX",
        capacity: 300,
        rows: 12,
        seatsPerRow: 25,
        status: "Active",
        movieAssigned: "Kantara: Chapter 1",
        timings: ["10:00 AM", "01:30 PM", "05:00 PM", "08:30 PM"],
        pricing: { regular: 180, premium: 250, recliner: 400, vip: 500 },
      },
      {
        id: "H502",
        name: "Palazzo Screen 2",
        screenType: "Dolby Atmos",
        capacity: 240,
        rows: 12,
        seatsPerRow: 20,
        status: "Active",
        movieAssigned: "Stree 2",
        timings: ["11:15 AM", "02:45 PM", "06:15 PM", "09:45 PM"],
        pricing: { regular: 150, premium: 220, recliner: 350, vip: 450 },
      },
    ],
  },
];

const generateDefaultSeatMap = (): Record<string, "available" | "booked" | "blocked" | "selected"> => {
  const map: Record<string, "available" | "booked" | "blocked" | "selected"> = {};
  const bookedSeats = ["A5", "A6", "B7", "B8", "B9", "C4", "C5", "D10", "D11", "E6", "E7", "E8", "F9", "F10", "G4", "G5"];
  const blockedSeats = ["A1", "A16", "J1", "J16"];
  const selectedSeats = ["G7", "G8"];

  ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].forEach((row) => {
    for (let c = 1; c <= 16; c++) {
      const id = `${row}${c}`;
      if (bookedSeats.includes(id)) {
        map[id] = "booked";
      } else if (blockedSeats.includes(id)) {
        map[id] = "blocked";
      } else if (selectedSeats.includes(id)) {
        map[id] = "selected";
      } else {
        map[id] = "available";
      }
    }
  });
  return map;
};

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Active Tab: Only Manage Movies, Manage Theatres & Halls, Personal Details
  const [activeTab, setActiveTab] = useState<"movies" | "theatres" | "profile">("movies");

  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: "Admin User",
    email: "admin@example.com",
    phone: "+91 98765 43210",
    role: "Super Admin",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<AdminProfile>(adminProfile);

  const [isMounted, setIsMounted] = useState(false);

  // Movies list initialized with rich multilingual dataset
  const [movies, setMovies] = useState<Movie[]>(defaultMoviesList);
  const [revenue, setRevenue] = useState(128450);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);

  const fetchBookings = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshingBookings(true);
      const resBookings = await fetch("/api/bookings?role=admin", { cache: "no-store" });
      if (resBookings.ok) {
        const bookingsData = await resBookings.json();
        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          const totalRev = bookingsData.reduce(
            (acc: number, b: any) =>
              !b.status || !b.status.toLowerCase().includes("cancel")
                ? acc + (b.amount || 0)
                : acc,
            0
          );
          if (totalRev > 0) setRevenue(totalRev);

          // ALWAYS sort by createdAt descending so newest bookings appear right at the top
          const sorted = [...bookingsData].sort((a: any, b: any) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (typeof a.id === "number" ? a.id : 0);
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (typeof b.id === "number" ? b.id : 0);
            return timeB - timeA;
          });

          const latest: ActivityItem[] = sorted.slice(0, 8).map((b: any) => {
            const seatsFormatted = Array.isArray(b.seats)
              ? b.seats.join(", ")
              : (b.seats || "Seats");
            return {
              id: b.id,
              text: `New booking for ${b.movieTitle || "Movie"} (${seatsFormatted})`,
              time: formatActivityTime(b.createdAt),
              amount: b.amount,
              status: b.status,
            };
          });
          if (latest.length > 0) setRecentActivity(latest);
          if (showToast) toast.success("Recent activity updated! ✅");
        }
      }
    } catch (error) {
      console.error("Admin bookings sync error:", error);
      if (showToast) toast.error("Failed to refresh bookings");
    } finally {
      if (showToast) setIsRefreshingBookings(false);
    }
  };

  // Theatres state with 5 top cinema halls matching enterprise dashboard
  const [theatresState, setTheatresState] = useState<Theatre[]>(defaultTheatres);
  const [theatreSubTab, setTheatreSubTab] = useState<
    "all" | "theatres" | "halls" | "allocation" | "layout" | "pricing"
  >("all");
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>("T1");
  const [selectedHallId, setSelectedHallId] = useState<string>("H1");
  const [theatreSearchQuery, setTheatreSearchQuery] = useState("");
  const [theatrePage, setTheatrePage] = useState(1);

  // Theatre form
  const [theatreForm, setTheatreForm] = useState({
    id: "T1" as string | null,
    name: "PVR: Sathyam Cinemas",
    city: "Chennai",
    status: "Active" as "Active" | "Inactive",
    area: "Royapettah",
    numHalls: 3,
    address: "8, Thiruvika Rd, Peters Colony, Royapettah, Chennai, Tamil Nadu 600014",
    googleMaps: "https://maps.google.com/?q=Sathyam+Cinemas+Royapettah+Chennai",
    phone: "+91 44 4392 0300",
    email: "sathyam@pvrcinemas.com",
    facilities: ["Parking", "Food Court", "AC", "WiFi", "Wheelchair Access"],
  });

  // Hall form
  const [hallForm, setHallForm] = useState({
    id: "H1" as string | null,
    theatreId: "T1",
    name: "Hall 1",
    screenType: "IMAX",
    capacity: 250,
    rows: 10,
    seatsPerRow: 16,
    status: "Active" as "Active" | "Inactive",
  });

  // Allocation form
  const [allocationForm, setAllocationForm] = useState({
    theatreId: "T1",
    hallId: "H1",
    movie: "Leo",
    date: new Date().toISOString().split("T")[0],
  });

  // Timings date & custom timing input
  const [timingsDate, setTimingsDate] = useState(new Date().toISOString().split("T")[0]);
  const [customTimingInput, setCustomTimingInput] = useState("");

  // Seat Layout & Pricing
  const [seatStatuses, setSeatStatuses] = useState<Record<string, "available" | "booked" | "blocked" | "selected">>(
    generateDefaultSeatMap
  );
  const [seatPricing, setSeatPricing] = useState({
    regular: 150,
    premium: 200,
    recliner: 350,
    vip: 450,
  });

  useEffect(() => {
    setIsMounted(true);

    const fetchData = async () => {
      try {
        const resMovies = await fetch("/api/movies");
        if (resMovies.ok) {
          const data = await resMovies.json();
          if (Array.isArray(data) && data.length > 0) {
            const merged = [...defaultMoviesList];
            data.forEach((backendM: Movie) => {
              const idx = merged.findIndex(
                (m) => m.title.toLowerCase() === backendM.title.toLowerCase()
              );
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...backendM };
              } else {
                merged.unshift(backendM);
              }
            });
            setMovies(merged);
          }
        }

        await fetchBookings(false);
      } catch (error) {
        console.error("Admin data sync error:", error);
      }
    };

    fetchData();

    // Auto-refresh bookings every 5 seconds so newly booked tickets immediately appear
    const interval = setInterval(() => {
      fetchBookings(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Modal State for Add / Edit Movie
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<MovieFormData>({
    id: null,
    title: "",
    genre: "",
    status: "Active",
    language: "Tamil",
    image: "/leo.jpg",
    duration: "150 min",
  });

  const handleLogout = () => {
    dispatch(logout());
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleSaveProfile = () => {
    setAdminProfile(tempProfile);
    setIsEditingProfile(false);
    toast.success("Admin Profile updated successfully!");
  };

  /* ===== Movies CRUD Logic ===== */
  const openAddModal = () => {
    setFormData({
      id: null,
      title: "",
      genre: "",
      status: "Active",
      language: "Tamil",
      image: "",
      duration: "150 min",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setFormData({
      id: movie.id,
      title: movie.title,
      genre: movie.genre,
      status: movie.status || "Active",
      language: movie.language || "Tamil",
      image: movie.image || "/leo.jpg",
      duration: movie.duration || "150 min",
    });
    setIsModalOpen(true);
  };

  const handleDeleteMovie = async (id: number) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      const movieToDelete = movies.find((m) => m.id === id);
      setMovies((prev) => prev.filter((m) => m.id !== id));

      // Cleanup halls playing this movie
      if (movieToDelete) {
        setTheatresState((prev) =>
          prev.map((theatre) => ({
            ...theatre,
            halls: theatre.halls.map((hall) => {
              if (hall.movieAssigned === movieToDelete.title) {
                return { ...hall, movieAssigned: null, timings: [] };
              }
              return hall;
            }),
          }))
        );
      }

      try {
        await fetch(`/api/movies?id=${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Delete movie API error:", err);
      }

      toast.success("Movie removed from roster.");
    }
  };

  const handleSaveMovie = async () => {
    if (!formData.title.trim() || !formData.genre.trim()) {
      toast.error("Title and Genre are required.");
      return;
    }

    const payload = {
      ...formData,
      image: formData.image?.trim() || "/leo.jpg",
      language: formData.language || "Tamil",
      duration: formData.duration || "150 min",
      status: formData.status || "Active",
      rating: "8.0",
    };

    if (formData.id) {
      // Update existing movie
      const oldTitle = movies.find((m) => m.id === formData.id)?.title;
      setMovies((prev) =>
        prev.map((m) =>
          m.id === formData.id
            ? { ...m, ...payload, id: formData.id as number }
            : m
        )
      );

      // Sync halls if movie title changed
      if (oldTitle && oldTitle !== formData.title) {
        setTheatresState((prev) =>
          prev.map((theatre) => ({
            ...theatre,
            halls: theatre.halls.map((hall) => {
              if (hall.movieAssigned === oldTitle) {
                return { ...hall, movieAssigned: formData.title };
              }
              return hall;
            }),
          }))
        );
      }

      try {
        await fetch("/api/movies", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Update movie API error:", err);
      }

      toast.success(`Movie "${formData.title}" updated successfully!`);
    } else {
      // Add new movie
      const newId = movies.length > 0 ? Math.max(...movies.map((m) => m.id)) + 1 : 100;
      const newMovie: Movie = {
        ...payload,
        id: newId,
      };
      setMovies((prev) => [newMovie, ...prev]);

      try {
        await fetch("/api/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMovie),
        });
      } catch (err) {
        console.error("Add movie API error:", err);
      }

      toast.success(`Movie "${formData.title}" added to ${formData.language} roster!`);
    }

    setIsModalOpen(false);
  };

  /* ===== Theatres & Halls Dashboard Logic ===== */
  const selectedTheatre =
    theatresState.find((t) => t.id === selectedTheatreId) || theatresState[0] || null;
  const selectedHall =
    selectedTheatre?.halls.find((h) => h.id === selectedHallId) ||
    selectedTheatre?.halls[0] ||
    null;

  const handleSelectTheatre = (theatre: Theatre) => {
    setSelectedTheatreId(theatre.id);
    setTheatreForm({
      id: theatre.id,
      name: theatre.name,
      city: theatre.city,
      status: theatre.status,
      area: theatre.area || "",
      numHalls: theatre.numHalls || theatre.halls.length,
      address: theatre.address || "",
      googleMaps: theatre.googleMaps || "",
      phone: theatre.phone || "",
      email: theatre.email || "",
      facilities: theatre.facilities || [],
    });

    const firstHall = theatre.halls[0];
    if (firstHall) {
      setSelectedHallId(firstHall.id);
      setHallForm({
        id: firstHall.id,
        theatreId: theatre.id,
        name: firstHall.name,
        screenType: firstHall.screenType || "2D",
        capacity: firstHall.capacity || 200,
        rows: firstHall.rows || 10,
        seatsPerRow: firstHall.seatsPerRow || 16,
        status: firstHall.status || "Active",
      });
      setAllocationForm((prev) => ({
        ...prev,
        theatreId: theatre.id,
        hallId: firstHall.id,
        movie: firstHall.movieAssigned || (movies[0]?.title ?? "Leo"),
      }));
      if (firstHall.pricing) {
        setSeatPricing(firstHall.pricing);
      }
    } else {
      setSelectedHallId("");
    }
  };

  const handleSelectHall = (hall: Hall) => {
    setSelectedHallId(hall.id);
    setHallForm({
      id: hall.id,
      theatreId: selectedTheatreId,
      name: hall.name,
      screenType: hall.screenType || "2D",
      capacity: hall.capacity || 200,
      rows: hall.rows || 10,
      seatsPerRow: hall.seatsPerRow || 16,
      status: hall.status || "Active",
    });
    setAllocationForm((prev) => ({
      ...prev,
      theatreId: selectedTheatreId,
      hallId: hall.id,
      movie: hall.movieAssigned || (movies[0]?.title ?? "Leo"),
    }));
    if (hall.pricing) {
      setSeatPricing(hall.pricing);
    }
  };

  const handleAddTheatreClick = () => {
    setTheatreForm({
      id: null,
      name: "",
      city: "Chennai",
      status: "Active",
      area: "",
      numHalls: 1,
      address: "",
      googleMaps: "",
      phone: "",
      email: "",
      facilities: ["Parking", "Food Court", "AC"],
    });
    toast.success("Ready to add a new theatre. Fill in the details! 📝");
  };

  const handleSaveTheatre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theatreForm.name.trim()) {
      toast.error("Please enter a theatre name");
      return;
    }

    if (theatreForm.id) {
      setTheatresState((prev) =>
        prev.map((t) =>
          t.id === theatreForm.id
            ? {
                ...t,
                name: theatreForm.name,
                city: theatreForm.city,
                status: theatreForm.status,
                area: theatreForm.area,
                numHalls: Number(theatreForm.numHalls) || t.halls.length,
                address: theatreForm.address,
                googleMaps: theatreForm.googleMaps,
                phone: theatreForm.phone,
                email: theatreForm.email,
                facilities: theatreForm.facilities,
              }
            : t
        )
      );
      toast.success(`Theatre "${theatreForm.name}" updated successfully! ✅`);
    } else {
      const newId = `T${Date.now().toString().slice(-4)}`;
      const newTheatre: Theatre = {
        id: newId,
        name: theatreForm.name,
        city: theatreForm.city,
        status: theatreForm.status,
        area: theatreForm.area,
        numHalls: Number(theatreForm.numHalls) || 1,
        address: theatreForm.address,
        googleMaps: theatreForm.googleMaps,
        phone: theatreForm.phone,
        email: theatreForm.email,
        facilities: theatreForm.facilities,
        halls: [
          {
            id: `H${Date.now().toString().slice(-3)}1`,
            name: "Hall 1",
            screenType: "2D",
            capacity: 200,
            rows: 10,
            seatsPerRow: 20,
            status: "Active",
            movieAssigned: movies[0]?.title || null,
            timings: ["10:30 AM", "02:00 PM", "06:30 PM", "10:00 PM"],
            pricing: { regular: 150, premium: 200, recliner: 350, vip: 450 },
          },
        ],
      };
      setTheatresState((prev) => [newTheatre, ...prev]);
      handleSelectTheatre(newTheatre);
      toast.success(`Theatre "${theatreForm.name}" added successfully! 🏢`);
    }
  };

  const handleDeleteTheatre = (theatreId: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const filtered = theatresState.filter((t) => t.id !== theatreId);
      setTheatresState(filtered);
      if (selectedTheatreId === theatreId && filtered.length > 0) {
        handleSelectTheatre(filtered[0]);
      }
      toast.success(`Theatre "${name}" deleted.`);
    }
  };

  const handleToggleFacility = (facility: string) => {
    setTheatreForm((prev) => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facility)
          : [...prev.facilities, facility],
      };
    });
  };

  const handleAddHallClick = () => {
    setHallForm({
      id: null,
      theatreId: selectedTheatreId,
      name: `Hall ${(selectedTheatre?.halls.length || 0) + 1}`,
      screenType: "IMAX",
      capacity: 200,
      rows: 10,
      seatsPerRow: 20,
      status: "Active",
    });
    toast.success("Ready to add new hall. Specify details in form! 🎬");
  };

  const handleSaveHall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hallForm.name.trim()) {
      toast.error("Please enter a hall name");
      return;
    }

    if (hallForm.id) {
      setTheatresState((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTheatreId) return t;
          return {
            ...t,
            halls: t.halls.map((h) =>
              h.id === hallForm.id
                ? {
                    ...h,
                    name: hallForm.name,
                    screenType: hallForm.screenType,
                    capacity: Number(hallForm.capacity) || h.capacity,
                    rows: Number(hallForm.rows) || h.rows,
                    seatsPerRow: Number(hallForm.seatsPerRow) || h.seatsPerRow,
                    status: hallForm.status,
                  }
                : h
            ),
          };
        })
      );
      toast.success(`Hall "${hallForm.name}" updated successfully! ✅`);
    } else {
      const newHallId = `H${Date.now().toString().slice(-4)}`;
      const newHall: Hall = {
        id: newHallId,
        name: hallForm.name,
        screenType: hallForm.screenType,
        capacity: Number(hallForm.capacity) || 200,
        rows: Number(hallForm.rows) || 10,
        seatsPerRow: Number(hallForm.seatsPerRow) || 20,
        status: hallForm.status,
        movieAssigned: null,
        timings: ["10:30 AM", "02:15 PM", "06:30 PM", "10:00 PM"],
        pricing: { regular: 150, premium: 200, recliner: 350, vip: 450 },
      };

      setTheatresState((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTheatreId) return t;
          return {
            ...t,
            numHalls: t.halls.length + 1,
            halls: [...t.halls, newHall],
          };
        })
      );
      setSelectedHallId(newHallId);
      setHallForm({
        ...hallForm,
        id: newHallId,
      });
      toast.success(`New hall "${hallForm.name}" added to ${selectedTheatre?.name}! 📽️`);
    }
  };

  const handleDeleteHallFromList = (hallId: string, hallName: string) => {
    if (confirm(`Are you sure you want to delete ${hallName}?`)) {
      setTheatresState((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTheatreId) return t;
          const filtered = t.halls.filter((h) => h.id !== hallId);
          return {
            ...t,
            numHalls: filtered.length,
            halls: filtered,
          };
        })
      );
      if (selectedHallId === hallId) {
        const remainingHalls = selectedTheatre?.halls.filter((h) => h.id !== hallId) || [];
        if (remainingHalls.length > 0) {
          handleSelectHall(remainingHalls[0]);
        }
      }
      toast.success(`Hall "${hallName}" deleted.`);
    }
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    setTheatresState((prev) =>
      prev.map((t) => {
        if (t.id !== allocationForm.theatreId) return t;
        return {
          ...t,
          halls: t.halls.map((h) => {
            if (h.id !== allocationForm.hallId) return h;
            return {
              ...h,
              movieAssigned: allocationForm.movie === "none" ? null : allocationForm.movie,
            };
          }),
        };
      })
    );
    toast.success(`Allocated "${allocationForm.movie}" to hall successfully! 🎬`);
  };

  const handleAddQuickTiming = (timeStr: string) => {
    if (!selectedHall) return;
    if (selectedHall.timings.includes(timeStr)) {
      toast.error(`Timing ${timeStr} already exists!`);
      return;
    }
    const updated = [...selectedHall.timings, timeStr];
    setTheatresState((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTheatreId) return t;
        return {
          ...t,
          halls: t.halls.map((h) => (h.id === selectedHall.id ? { ...h, timings: updated } : h)),
        };
      })
    );
    toast.success(`Added timing ${timeStr} ⏰`);
  };

  const handleAddCustomTiming = () => {
    if (!customTimingInput.trim() || !selectedHall) return;
    if (selectedHall.timings.includes(customTimingInput.trim())) {
      toast.error("Timing already added!");
      return;
    }
    const updated = [...selectedHall.timings, customTimingInput.trim()];
    setTheatresState((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTheatreId) return t;
        return {
          ...t,
          halls: t.halls.map((h) => (h.id === selectedHall.id ? { ...h, timings: updated } : h)),
        };
      })
    );
    setCustomTimingInput("");
    toast.success("Show timing added! ⏰");
  };

  const handleDeleteTiming = (timingToRemove: string) => {
    if (!selectedHall) return;
    const updated = selectedHall.timings.filter((t) => t !== timingToRemove);
    setTheatresState((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTheatreId) return t;
        return {
          ...t,
          halls: t.halls.map((h) => (h.id === selectedHall.id ? { ...h, timings: updated } : h)),
        };
      })
    );
    toast.success(`Removed timing ${timingToRemove}`);
  };

  const handleSaveTimings = () => {
    toast.success(`Timings saved for ${selectedHall?.name || "Hall"} on ${timingsDate}! ✅`);
  };

  const handleSeatClick = (seatId: string) => {
    setSeatStatuses((prev) => {
      const cur = prev[seatId] || "available";
      let next: "available" | "booked" | "blocked" | "selected" = "available";
      if (cur === "available") next = "selected";
      else if (cur === "selected") next = "blocked";
      else if (cur === "blocked") next = "available";
      else if (cur === "booked") next = "available";
      return { ...prev, [seatId]: next };
    });
  };

  const handleBlockAllSelectedSeats = () => {
    let count = 0;
    const next = { ...seatStatuses };
    Object.keys(next).forEach((key) => {
      if (next[key] === "selected") {
        next[key] = "blocked";
        count++;
      }
    });
    setSeatStatuses(next);
    if (count === 0) {
      toast("Click any seat to select it yellow first, then click Block Seat!", { icon: "ℹ️" });
    } else {
      toast.success(`Blocked ${count} selected seats! ⬛`);
    }
  };

  const handleSaveSeatLayout = () => {
    toast.success(`Seat layout saved for ${selectedHall?.name || "Hall 1"}! 💺`);
  };

  const handleSavePricing = () => {
    if (!selectedHall) return;
    setTheatresState((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTheatreId) return t;
        return {
          ...t,
          halls: t.halls.map((h) =>
            h.id === selectedHall.id ? { ...h, pricing: seatPricing } : h
          ),
        };
      })
    );
    toast.success(`Pricing updated for ${selectedHall.name}! 💰`);
  };

  const filteredTheatres = theatresState.filter(
    (t) =>
      t.name.toLowerCase().includes(theatreSearchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(theatreSearchQuery.toLowerCase())
  );
  const pageSize = 4;
  const totalPages = Math.ceil(filteredTheatres.length / pageSize) || 1;
  const currentTheatresPage = filteredTheatres.slice(
    (theatrePage - 1) * pageSize,
    theatrePage * pageSize
  );

  return (
    <div className={styles.adminWrapper}>
      <header className={styles.header}>
        <h1>Admin Console</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {/* Stats Row - Bookings and Users removed as requested */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Movies</div>
          <div className={styles.statValue} suppressHydrationWarning>{movies.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Theatres</div>
          <div className={styles.statValue} suppressHydrationWarning>{theatresState.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Screenings</div>
          <div className={styles.statValue} suppressHydrationWarning>
            {theatresState.reduce(
              (acc, t) => acc + t.halls.filter((h) => h.movieAssigned).length,
              0
            )}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Revenue</div>
          <div className={styles.statValue} suppressHydrationWarning>
            {isMounted ? `₹${revenue.toLocaleString("en-IN")}` : `₹${revenue}`}
          </div>
        </div>
      </div>

      {/* Tabs Container - Bookings & Tickets and Manage Users removed */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === "movies" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          🎬 Manage Movies ({movies.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "theatres" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("theatres")}
        >
          🏢 Manage Theatres &amp; Halls ({theatresState.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "profile" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤 Personal Details
        </button>
      </div>

      {/* ===== MOVIES TAB ===== */}
      {activeTab === "movies" && (
        <div className={styles.contentGrid}>
          <div className={styles.section}>
            <h2>
              Movies Roster
              <button className={styles.addBtn} onClick={openAddModal}>
                + Add Movie
              </button>
            </h2>
            <table className={styles.movieTable}>
              <thead>
                <tr>
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id}>
                    <td>
                      <img
                        src={movie.image || "/leo.jpg"}
                        alt={movie.title}
                        style={{
                          width: "42px",
                          height: "58px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #333",
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/leo.jpg";
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 700, color: "#fff" }}>{movie.title}</td>
                    <td style={{ color: "#aaa" }}>{movie.genre}</td>
                    <td>
                      <span
                        style={{
                          background:
                            movie.language === "Tamil"
                              ? "rgba(255, 26, 117, 0.2)"
                              : movie.language === "Malayalam"
                              ? "rgba(34, 197, 94, 0.2)"
                              : movie.language === "Telugu"
                              ? "rgba(234, 179, 8, 0.2)"
                              : "rgba(56, 189, 248, 0.2)",
                          color:
                            movie.language === "Tamil"
                              ? "#ff4d88"
                              : movie.language === "Malayalam"
                              ? "#4ade80"
                              : movie.language === "Telugu"
                              ? "#facc15"
                              : "#38bdf8",
                          padding: "3px 9px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                        }}
                      >
                        {movie.language || "Tamil"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: movie.status === "Active" ? "#4ade80" : "#94a3b8",
                          fontWeight: 600,
                        }}
                      >
                        {movie.status || "Active"}
                      </span>
                    </td>
                    <td className={styles.actionBtns}>
                      <button className={styles.editBtn} onClick={() => openEditModal(movie)}>
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteMovie(movie.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {movies.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                      No movies found in the roster.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.35rem" }}>Recent Activity</h2>
              <button
                type="button"
                onClick={() => fetchBookings(true)}
                disabled={isRefreshingBookings}
                style={{
                  background: isRefreshingBookings ? "#333" : "rgba(255, 77, 77, 0.12)",
                  color: "#ff6b6b",
                  border: "1px solid rgba(255, 77, 77, 0.3)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "0.82rem",
                  cursor: isRefreshingBookings ? "wait" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                title="Refresh recent bookings"
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: isRefreshingBookings ? "rotate(360deg)" : "none",
                    transition: "transform 0.5s ease",
                  }}
                >
                  🔄
                </span>
                {isRefreshingBookings ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <ul className={styles.activityList}>
              {recentActivity.length === 0 ? (
                <li style={{ color: "#777", padding: "20px 0", textAlign: "center", fontSize: "0.9rem" }}>
                  No recent bookings found.
                </li>
              ) : (
                recentActivity.map((activity, index) => (
                  <li key={activity.id || index} className={styles.activityItem}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.92rem", margin: 0 }}>
                        {activity.text}
                      </span>
                      {activity.amount && (
                        <span style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap", margin: 0 }}>
                          ₹{activity.amount.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
                      <span suppressHydrationWarning style={{ color: "#888", fontSize: "0.8rem", margin: 0 }}>
                        {activity.time}
                      </span>
                      {activity.status && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            margin: 0,
                            fontWeight: 600,
                            background: activity.status.toLowerCase().includes("cancel")
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(34, 197, 94, 0.2)",
                            color: activity.status.toLowerCase().includes("cancel")
                              ? "#f87171"
                              : "#4ade80",
                          }}
                        >
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* ===== THEATRES & HALLS TAB (ENTERPRISE DASHBOARD MATCHING IMAGE 2) ===== */}
      {activeTab === "theatres" && (
        <div className={styles.theatresDashboard}>
          {/* Header Bar */}
          <div className={styles.theatresHeader}>
            <div className={styles.theatresHeaderLeft}>
              <div className={styles.headerIconBox}>🏢</div>
              <div>
                <h2 className={styles.theatresHeaderTitle}>Manage Theatres &amp; Halls</h2>
                <p className={styles.theatresHeaderSubtitle}>
                  Configure cinema locations, screens, seating layouts &amp; pricing
                </p>
              </div>
            </div>
            <button
              type="button"
              className={styles.addTheatreBtn}
              onClick={handleAddTheatreClick}
            >
              + Add Theatre
            </button>
          </div>

          {/* Sub-Tabs Pill Navigation */}
          <div className={styles.subTabsBar}>
            <button
              type="button"
              className={`${styles.subTabBtn} ${theatreSubTab === "all" ? styles.activeSubTabBtn : ""}`}
              onClick={() => setTheatreSubTab("all")}
            >
              All Modules
            </button>
            <button
              type="button"
              className={`${styles.subTabBtn} ${theatreSubTab === "theatres" ? styles.activeSubTabBtn : ""}`}
              onClick={() => setTheatreSubTab("theatres")}
            >
              Theatres
            </button>
            <button
              type="button"
              className={`${styles.subTabBtn} ${theatreSubTab === "halls" ? styles.activeSubTabBtn : ""}`}
              onClick={() => setTheatreSubTab("halls")}
            >
              Halls / Screens
            </button>
            <button
              type="button"
              className={`${styles.subTabBtn} ${theatreSubTab === "allocation" ? styles.activeSubTabBtn : ""}`}
              onClick={() => setTheatreSubTab("allocation")}
            >
              Hall-Movie Allocation
            </button>
            <button
              type="button"
              className={`${styles.subTabBtn} ${theatreSubTab === "layout" ? styles.activeSubTabBtn : ""}`}
              onClick={() => setTheatreSubTab("layout")}
            >
              Seat Layout
            </button>
            <button
              type="button"
              className={`${styles.subTabBtn} ${theatreSubTab === "pricing" ? styles.activeSubTabBtn : ""}`}
              onClick={() => setTheatreSubTab("pricing")}
            >
              Pricing
            </button>
          </div>

          {/* ROW 1: Theatre Details Form & Theatres List */}
          {(theatreSubTab === "all" || theatreSubTab === "theatres") && (
            <div className={styles.row1Grid}>
              {/* Theatre Details Form */}
              <div className={styles.dashCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardHeadTitle}>
                    <span>🏛️</span> Theatre Details
                  </h3>
                </div>
                <form onSubmit={handleSaveTheatre}>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Theatre Name <span className={styles.reqStar}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={theatreForm.name}
                        onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                        placeholder="e.g. PVR: Sathyam Cinemas"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        City <span className={styles.reqStar}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={theatreForm.city}
                        onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                        placeholder="e.g. Chennai"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Status</label>
                      <select
                        className={styles.formSelect}
                        value={theatreForm.status}
                        onChange={(e) =>
                          setTheatreForm({
                            ...theatreForm,
                            status: e.target.value as "Active" | "Inactive",
                          })
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Area / Locality</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={theatreForm.area}
                        onChange={(e) => setTheatreForm({ ...theatreForm, area: e.target.value })}
                        placeholder="e.g. Royapettah"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Number of Halls</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={theatreForm.numHalls}
                        onChange={(e) =>
                          setTheatreForm({
                            ...theatreForm,
                            numHalls: Number(e.target.value) || 1,
                          })
                        }
                        min={1}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Contact Number</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={theatreForm.phone}
                        onChange={(e) => setTheatreForm({ ...theatreForm, phone: e.target.value })}
                        placeholder="e.g. +91 44 4392 0300"
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>Full Address</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={theatreForm.address}
                        onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                        placeholder="Full postal address"
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>Google Maps Link</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={theatreForm.googleMaps}
                        onChange={(e) =>
                          setTheatreForm({ ...theatreForm, googleMaps: e.target.value })
                        }
                        placeholder="https://maps.google.com/..."
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>Email Address</label>
                      <input
                        type="email"
                        className={styles.formInput}
                        value={theatreForm.email}
                        onChange={(e) => setTheatreForm({ ...theatreForm, email: e.target.value })}
                        placeholder="e.g. manager@pvrcinemas.com"
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>Facilities Available</label>
                      <div className={styles.facilitiesGrid}>
                        {ALL_FACILITIES.map((facility) => {
                          const checked = theatreForm.facilities.includes(facility);
                          return (
                            <label key={facility} className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleFacility(facility)}
                              />
                              <span>{facility}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={styles.formBtnRow}>
                    <button type="submit" className={styles.purpleSaveBtn}>
                      Save Theatre
                    </button>
                    <button
                      type="button"
                      className={styles.cancelGrayBtn}
                      onClick={() => {
                        if (selectedTheatre) handleSelectTheatre(selectedTheatre);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Theatres List Table */}
              <div className={styles.dashCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardHeadTitle}>
                    <span>📋</span> Theatres List
                  </h3>
                </div>

                <div className={styles.theatreSearchBox}>
                  <span className={styles.theatreSearchIcon}>🔍</span>
                  <input
                    type="text"
                    className={styles.theatreSearchInput}
                    placeholder="Search by theatre name or city..."
                    value={theatreSearchQuery}
                    onChange={(e) => {
                      setTheatreSearchQuery(e.target.value);
                      setTheatrePage(1);
                    }}
                  />
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.dashTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Theatre Name</th>
                        <th>City</th>
                        <th>Halls</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTheatresPage.length > 0 ? (
                        currentTheatresPage.map((theatre, idx) => {
                          const isSelected = theatre.id === selectedTheatreId;
                          return (
                            <tr
                              key={theatre.id}
                              style={{
                                cursor: "pointer",
                                background: isSelected ? "rgba(99, 102, 241, 0.12)" : undefined,
                              }}
                              onClick={() => handleSelectTheatre(theatre)}
                            >
                              <td>{(theatrePage - 1) * pageSize + idx + 1}</td>
                              <td style={{ fontWeight: 600 }}>{theatre.name}</td>
                              <td>{theatre.city}</td>
                              <td>{theatre.halls.length || theatre.numHalls}</td>
                              <td>
                                <span
                                  className={
                                    theatre.status === "Active"
                                      ? styles.statusActive
                                      : styles.statusInactive
                                  }
                                >
                                  {theatre.status}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div
                                  className={styles.actionBtnGroup}
                                  style={{ justifyContent: "flex-end" }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    className={styles.actionIconBtn}
                                    onClick={() => handleSelectTheatre(theatre)}
                                    title="Edit Theatre"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.actionDeleteBtn}
                                    onClick={() =>
                                      handleDeleteTheatre(theatre.id, theatre.name)
                                    }
                                    title="Delete Theatre"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            style={{ textAlign: "center", color: "#64748b", padding: "24px" }}
                          >
                            No theatres found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className={styles.paginationRow}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={theatrePage <= 1}
                    onClick={() => setTheatrePage((p) => Math.max(1, p - 1))}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.pageBtn} ${
                        theatrePage === p ? styles.pageBtnActive : ""
                      }`}
                      onClick={() => setTheatrePage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={theatrePage >= totalPages}
                    onClick={() => setTheatrePage((p) => Math.min(totalPages, p + 1))}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ROW 2: Hall / Screen Details & Halls List */}
          {(theatreSubTab === "all" || theatreSubTab === "halls") && (
            <div className={styles.row2Grid}>
              {/* Hall Details Form */}
              <div className={styles.dashCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardHeadTitle}>
                    <span>🖥️</span> Hall / Screen Details
                  </h3>
                </div>
                <form onSubmit={handleSaveHall}>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Select Theatre <span className={styles.reqStar}>*</span>
                      </label>
                      <select
                        className={styles.formSelect}
                        value={hallForm.theatreId}
                        onChange={(e) => {
                          const tId = e.target.value;
                          const t = theatresState.find((x) => x.id === tId);
                          if (t) handleSelectTheatre(t);
                        }}
                      >
                        {theatresState.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Hall Name / Number <span className={styles.reqStar}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={hallForm.name}
                        onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                        placeholder="e.g. Hall 1"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Screen Type</label>
                      <select
                        className={styles.formSelect}
                        value={hallForm.screenType}
                        onChange={(e) =>
                          setHallForm({ ...hallForm, screenType: e.target.value })
                        }
                      >
                        {SCREEN_TYPES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Seat Capacity</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={hallForm.capacity}
                        onChange={(e) =>
                          setHallForm({
                            ...hallForm,
                            capacity: Number(e.target.value) || 0,
                          })
                        }
                        min={10}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Rows</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={hallForm.rows}
                        onChange={(e) =>
                          setHallForm({ ...hallForm, rows: Number(e.target.value) || 1 })
                        }
                        min={1}
                        max={26}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Seats per Row</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={hallForm.seatsPerRow}
                        onChange={(e) =>
                          setHallForm({
                            ...hallForm,
                            seatsPerRow: Number(e.target.value) || 1,
                          })
                        }
                        min={1}
                        max={35}
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>Status</label>
                      <select
                        className={styles.formSelect}
                        value={hallForm.status}
                        onChange={(e) =>
                          setHallForm({
                            ...hallForm,
                            status: e.target.value as "Active" | "Inactive",
                          })
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formBtnRow}>
                    <button type="submit" className={styles.purpleSaveBtn}>
                      Save Hall
                    </button>
                    <button
                      type="button"
                      className={styles.cancelGrayBtn}
                      onClick={() => {
                        if (selectedHall) handleSelectHall(selectedHall);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Halls List Table */}
              <div className={styles.dashCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardHeadTitle}>
                    <span>🎥</span> Halls List ({selectedTheatre?.name || "Selected Theatre"})
                  </h3>
                  <button
                    type="button"
                    className={styles.addTheatreBtn}
                    onClick={handleAddHallClick}
                    style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                  >
                    + Add Hall
                  </button>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.dashTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Hall Name</th>
                        <th>Screen Type</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTheatre && selectedTheatre.halls.length > 0 ? (
                        selectedTheatre.halls.map((hall, idx) => {
                          const isSelected = hall.id === selectedHallId;
                          return (
                            <tr
                              key={hall.id}
                              style={{
                                cursor: "pointer",
                                background: isSelected ? "rgba(99, 102, 241, 0.12)" : undefined,
                              }}
                              onClick={() => handleSelectHall(hall)}
                            >
                              <td>{idx + 1}</td>
                              <td style={{ fontWeight: 600 }}>{hall.name}</td>
                              <td>
                                <span
                                  style={{
                                    background: "rgba(99, 102, 241, 0.15)",
                                    color: "#818cf8",
                                    padding: "2px 7px",
                                    borderRadius: "4px",
                                    fontSize: "0.74rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {hall.screenType}
                                </span>
                              </td>
                              <td>{hall.capacity}</td>
                              <td>
                                <span
                                  className={
                                    hall.status === "Active"
                                      ? styles.statusActive
                                      : styles.statusInactive
                                  }
                                >
                                  {hall.status}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div
                                  className={styles.actionBtnGroup}
                                  style={{ justifyContent: "flex-end" }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    className={styles.actionIconBtn}
                                    onClick={() => handleSelectHall(hall)}
                                    title="Edit Hall"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.actionDeleteBtn}
                                    onClick={() =>
                                      handleDeleteHallFromList(hall.id, hall.name)
                                    }
                                    title="Delete Hall"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            style={{ textAlign: "center", color: "#64748b", padding: "24px" }}
                          >
                            No halls found for this theatre. Click &quot;+ Add Hall&quot; above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ROW 3: 4 CARDS (Allocation, Timings, Seat Layout, Pricing) */}
          {(theatreSubTab === "all" ||
            theatreSubTab === "allocation" ||
            theatreSubTab === "layout" ||
            theatreSubTab === "pricing") && (
            <div className={styles.row3Grid}>
              {/* Card 1: Hall-Movie Allocation */}
              <div className={styles.dashCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardHeadTitle}>
                    <span>🎬</span> Hall-Movie Allocation
                  </h3>
                </div>
                <form
                  onSubmit={handleSaveAllocation}
                  style={{ display: "flex", flexDirection: "column", height: "100%" }}
                >
                  <div className={styles.formGroup} style={{ marginBottom: "10px" }}>
                    <label className={styles.formLabel}>Select Theatre</label>
                    <select
                      className={styles.formSelect}
                      value={allocationForm.theatreId}
                      onChange={(e) => {
                        const tId = e.target.value;
                        const foundT = theatresState.find((t) => t.id === tId);
                        setAllocationForm({
                          ...allocationForm,
                          theatreId: tId,
                          hallId: foundT?.halls[0]?.id || "",
                        });
                      }}
                    >
                      {theatresState.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: "10px" }}>
                    <label className={styles.formLabel}>Select Hall / Screen</label>
                    <select
                      className={styles.formSelect}
                      value={allocationForm.hallId}
                      onChange={(e) =>
                        setAllocationForm({ ...allocationForm, hallId: e.target.value })
                      }
                    >
                      {theatresState
                        .find((t) => t.id === allocationForm.theatreId)
                        ?.halls.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} - {h.screenType} ({h.capacity} seats)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: "10px" }}>
                    <label className={styles.formLabel}>Assign Movie</label>
                    <select
                      className={styles.formSelect}
                      value={allocationForm.movie}
                      onChange={(e) =>
                        setAllocationForm({ ...allocationForm, movie: e.target.value })
                      }
                    >
                      <option value="none">-- Unassigned (Vacant) --</option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.title}>
                          {m.title} ({m.language || "Tamil"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: "16px" }}>
                    <label className={styles.formLabel}>Assigned Date</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={allocationForm.date}
                      onChange={(e) =>
                        setAllocationForm({ ...allocationForm, date: e.target.value })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.purpleSaveBtn}
                    style={{ width: "100%", marginTop: "auto" }}
                  >
                    Save Allocation
                  </button>
                </form>
              </div>

              {/* Card 2: Show Timings */}
              <div className={styles.dashCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardHeadTitle}>
                    <span>⏰</span> Show Timings
                  </h3>
                </div>
                <div className={styles.formGroup} style={{ marginBottom: "12px" }}>
                  <label className={styles.formLabel}>Select Date</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={timingsDate}
                    onChange={(e) => setTimingsDate(e.target.value)}
                  />
                </div>

                <div className={styles.formLabel} style={{ marginBottom: "6px" }}>
                  Quick Add Timings
                </div>
                <div className={styles.timingPillsGrid}>
                  {QUICK_TIMINGS.map((timeStr) => (
                    <button
                      key={timeStr}
                      type="button"
                      className={styles.quickTimingPill}
                      onClick={() => handleAddQuickTiming(timeStr)}
                      title="Add to current hall"
                    >
                      + {timeStr}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                  <input
                    type="text"
                    placeholder="e.g. 09:15 PM"
                    className={styles.formInput}
                    value={customTimingInput}
                    onChange={(e) => setCustomTimingInput(e.target.value)}
                    style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                  />
                  <button
                    type="button"
                    className={styles.addTimingCustomBtn}
                    onClick={handleAddCustomTiming}
                    style={{ marginBottom: 0, whiteSpace: "nowrap" }}
                  >
                    + Add
                  </button>
                </div>

                <div className={styles.formLabel} style={{ marginBottom: "6px" }}>
                  Current Timings ({selectedHall?.name || "Hall"}):
                </div>
                <div className={styles.currentTimingsList}>
                  {selectedHall && selectedHall.timings.length > 0 ? (
                    selectedHall.timings.map((time, idx) => (
                      <div key={idx} className={styles.currentTimingItem}>
                        <span>{time}</span>
                        <button
                          type="button"
                          className={styles.actionDeleteBtn}
                          onClick={() => handleDeleteTiming(time)}
                          title="Delete timing"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#64748b", fontSize: "0.8rem", padding: "6px 0" }}>
                      No timings configured.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.purpleSaveBtn}
                  onClick={handleSaveTimings}
                  style={{ width: "100%", marginTop: "auto" }}
                >
                  Save Timings
                </button>
              </div>

              {/* Card 3: Seat Layout */}
              <div className={styles.dashCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardHeadTitle}>
                    <span>💺</span> Seat Layout
                  </h3>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      color: "#a5b4fc",
                      background: "rgba(99, 102, 241, 0.15)",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontWeight: 600,
                    }}
                  >
                    {selectedHall?.name || "Hall 1"} - {selectedHall?.screenType || "IMAX"} (
                    {selectedHall?.capacity || 250} Seats)
                  </span>
                </div>

                {/* Legend */}
                <div className={styles.seatLegendRow}>
                  <div className={styles.legendPill}>
                    <span className={`${styles.legendDot} ${styles.seatAvailable}`} /> Available
                  </div>
                  <div className={styles.legendPill}>
                    <span className={`${styles.legendDot} ${styles.seatBooked}`} /> Booked
                  </div>
                  <div className={styles.legendPill}>
                    <span className={`${styles.legendDot} ${styles.seatBlocked}`} /> Blocked
                  </div>
                  <div className={styles.legendPill}>
                    <span className={`${styles.legendDot} ${styles.seatSelected}`} /> Selected
                  </div>
                </div>

                {/* Screen Arc */}
                <div className={styles.screenArcWrapper}>
                  <svg className={styles.screenArcSvg} viewBox="0 0 320 24">
                    <path
                      d="M 15,20 Q 160,2 305,20"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  </svg>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      letterSpacing: "3px",
                      color: "#818cf8",
                      fontWeight: 700,
                      marginTop: "-4px",
                    }}
                  >
                    SCREEN
                  </div>
                </div>

                {/* Seat Grid */}
                <div className={styles.seatGridContainer}>
                  {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((row) => (
                    <div key={row} className={styles.seatRow}>
                      <span className={styles.seatRowLabel}>{row}</span>
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((col) => {
                        const seatId = `${row}${col}`;
                        const status = seatStatuses[seatId] || "available";
                        const statusClass =
                          status === "booked"
                            ? styles.seatBooked
                            : status === "blocked"
                            ? styles.seatBlocked
                            : status === "selected"
                            ? styles.seatSelected
                            : styles.seatAvailable;

                        return (
                          <div
                            key={seatId}
                            className={`${styles.seatBox} ${statusClass}`}
                            onClick={() => handleSeatClick(seatId)}
                            title={`Seat ${seatId} (${status})`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Layout Action Buttons */}
                <div className={styles.seatActionsRow}>
                  <button
                    type="button"
                    className={styles.cancelGrayBtn}
                    onClick={() => {
                      setSeatStatuses(generateDefaultSeatMap());
                      toast.success("Seat layout reset to default!");
                    }}
                    style={{ padding: "7px 12px", fontSize: "0.8rem" }}
                  >
                    Edit Layout
                  </button>
                  <button
                    type="button"
                    className={styles.cancelGrayBtn}
                    onClick={handleBlockAllSelectedSeats}
                    style={{
                      padding: "7px 12px",
                      fontSize: "0.8rem",
                      borderColor: "rgba(234, 179, 8, 0.4)",
                      color: "#facc15",
                    }}
                  >
                    Block Seat
                  </button>
                  <button
                    type="button"
                    className={styles.purpleSaveBtn}
                    onClick={handleSaveSeatLayout}
                    style={{
                      padding: "7px 16px",
                      fontSize: "0.8rem",
                      marginLeft: "auto",
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Card 4: Seat Pricing */}
              <div className={styles.dashCard}>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardHeadTitle}>
                    <span>💰</span> Seat Pricing
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#94a3b8",
                    marginBottom: "12px",
                  }}
                >
                  {selectedHall?.name || "Hall 1"} ({selectedTheatre?.name || "Cinema"})
                </div>

                <table className={styles.pricingTable}>
                  <thead>
                    <tr>
                      <th>Seat Category</th>
                      <th style={{ textAlign: "right" }}>Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Regular</td>
                      <td style={{ textAlign: "right" }}>
                        <input
                          type="number"
                          className={styles.priceInput}
                          value={seatPricing.regular}
                          onChange={(e) =>
                            setSeatPricing({
                              ...seatPricing,
                              regular: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Premium</td>
                      <td style={{ textAlign: "right" }}>
                        <input
                          type="number"
                          className={styles.priceInput}
                          value={seatPricing.premium}
                          onChange={(e) =>
                            setSeatPricing({
                              ...seatPricing,
                              premium: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Recliner</td>
                      <td style={{ textAlign: "right" }}>
                        <input
                          type="number"
                          className={styles.priceInput}
                          value={seatPricing.recliner}
                          onChange={(e) =>
                            setSeatPricing({
                              ...seatPricing,
                              recliner: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>VIP</td>
                      <td style={{ textAlign: "right" }}>
                        <input
                          type="number"
                          className={styles.priceInput}
                          value={seatPricing.vip}
                          onChange={(e) =>
                            setSeatPricing({
                              ...seatPricing,
                              vip: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <button
                  type="button"
                  className={styles.purpleSaveBtn}
                  onClick={handleSavePricing}
                  style={{ width: "100%", marginTop: "auto" }}
                >
                  Save Pricing
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== PROFILE TAB ===== */}
      {activeTab === "profile" && (
        <div className={`${styles.contentGrid} ${styles.fullWidth}`}>
          <div className={styles.profileSection}>
            <div className={styles.profileHeader}>
              <h2>Personal Details</h2>
              {!isEditingProfile ? (
                 <button className={styles.editBtn} onClick={() => { setTempProfile(adminProfile); setIsEditingProfile(true); }}>Edit Profile</button>
              ) : (
                 <div className={styles.actionBtns}>
                   <button className={styles.cancelBtn} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                   <button className={styles.saveBtn} onClick={handleSaveProfile}>Save</button>
                 </div>
              )}
            </div>
            
            <div className={styles.profileDetails}>
              {isEditingProfile ? (
                <>
                  <div className={styles.formGroup}>
                    <label>Name</label>
                    <input type="text" className={styles.formInput} value={tempProfile.name} onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} placeholder="Enter name" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" className={styles.formInput} value={tempProfile.email} onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})} placeholder="Enter email" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input type="text" className={styles.formInput} value={tempProfile.phone} onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})} placeholder="Enter phone" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <input type="text" className={styles.formInput} value={tempProfile.role} disabled title="Role cannot be changed" />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>Name</span>
                    <span className={styles.profileValue}>{adminProfile.name}</span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>Email</span>
                    <span className={styles.profileValue}>{adminProfile.email}</span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>Phone</span>
                    <span className={styles.profileValue}>{adminProfile.phone}</span>
                  </div>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>Role</span>
                    <span className={styles.profileValue}>{adminProfile.role}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD / EDIT MOVIE MODAL ===== */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h2>{formData.id ? "Update Movie" : "Add New Movie"}</h2>
            
            <div className={styles.formGroup}>
              <label>Title</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="Enter movie title"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Genre</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formData.genre} 
                onChange={(e) => setFormData({...formData, genre: e.target.value})} 
                placeholder="e.g. Action, Thriller, Drama"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Language</label>
              <select 
                className={styles.formInput} 
                value={formData.language || "Tamil"} 
                onChange={(e) => setFormData({...formData, language: e.target.value})}
              >
                <option value="Tamil">Tamil</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Poster Image (URL or /leo.jpg)</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formData.image || ""} 
                onChange={(e) => setFormData({...formData, image: e.target.value})} 
                placeholder="e.g. /leo.jpg or https://images.unsplash.com/..."
              />
              {formData.image && (
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <img 
                    src={formData.image} 
                    alt="Poster Preview" 
                    style={{ width: "45px", height: "65px", objectFit: "cover", borderRadius: "4px", border: "1px solid #444" }} 
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/leo.jpg"; }} 
                  />
                  <span style={{ fontSize: "0.8rem", color: "#888" }}>Poster Preview</span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Duration</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formData.duration || ""} 
                onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                placeholder="e.g. 150 min"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select 
                className={styles.formInput} 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveMovie}>Save Movie</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
