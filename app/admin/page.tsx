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
  movieAssigned: string | null;
  timings: string[];
}

interface Theatre {
  id: string;
  name: string;
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
  const [recentActivity, setRecentActivity] = useState<Array<{ text: string; time: string }>>([
    { text: "Movie 'Pushpa 2: The Rule' added to Tamil & Telugu roster", time: "10 mins ago" },
    { text: "Assigned 'Manjummel Boys' to Screen 1 (4DX)", time: "25 mins ago" },
    { text: "Updated show timings for 'Leo' at Sathyam Cinemas", time: "1 hour ago" },
  ]);

  // Theatres state with top cinema halls across South India
  const [theatresState, setTheatresState] = useState<Theatre[]>([
    {
      id: "T1",
      name: "PVR: Sathyam Cinemas, Chennai",
      halls: [
        { id: "H101", name: "Hall 1 (Main Screen)", movieAssigned: "Leo", timings: ["10:30 AM", "01:15 PM", "04:45 PM", "08:15 PM"] },
        { id: "H102", name: "Hall 2 (IMAX Laser)", movieAssigned: "Viduthalai", timings: ["12:00 PM", "04:00 PM", "08:00 PM"] },
        { id: "H103", name: "Hall 3 (RGB 4K)", movieAssigned: "Jailer", timings: ["11:00 AM", "02:30 PM", "06:00 PM", "09:30 PM"] },
      ],
    },
    {
      id: "T2",
      name: "INOX: Luxe (Phoenix Marketcity), Chennai",
      halls: [
        { id: "H201", name: "Screen 1 (4DX)", movieAssigned: "Manjummel Boys", timings: ["11:00 AM", "02:30 PM", "06:00 PM"] },
        { id: "H202", name: "Screen 2 (Dolby Atmos)", movieAssigned: "Pushpa 2: The Rule", timings: ["10:00 AM", "01:45 PM", "05:30 PM", "09:15 PM"] },
        { id: "H203", name: "Screen 3", movieAssigned: "Aavesham", timings: ["12:30 PM", "04:00 PM", "07:30 PM"] },
      ],
    },
    {
      id: "T3",
      name: "ARRS Multiplex, Meyyanur, Salem",
      halls: [
        { id: "H301", name: "Screen 1 (Barco Laser)", movieAssigned: "Amaran", timings: ["10:15 AM", "01:30 PM", "04:45 PM", "07:30 PM"] },
        { id: "H302", name: "Screen 2 (Dolby 7.1)", movieAssigned: "Jawan", timings: ["11:00 AM", "02:45 PM", "08:15 PM"] },
      ],
    },
  ]);

  useEffect(() => {
    setIsMounted(true);

    // Optionally fetch server-side movies and bookings
    const fetchData = async () => {
      try {
        const resMovies = await fetch("/api/movies");
        if (resMovies.ok) {
          const data = await resMovies.json();
          if (Array.isArray(data) && data.length > 0) {
            // Merge backend movies with defaultMoviesList
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

        const resBookings = await fetch("/api/bookings?role=admin");
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

            const latest = bookingsData.slice(-3).reverse().map((b: any) => ({
              text: `New booking for ${b.movieTitle || "Movie"} (${b.seats || "Seats"})`,
              time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            }));
            if (latest.length > 0) setRecentActivity(latest);
          }
        }
      } catch (error) {
        console.error("Admin data sync error:", error);
      }
    };

    fetchData();
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

  /* ===== Theatres Logic ===== */
  const handleAssignMovie = (theatreId: string, hallId: string, movieTitle: string) => {
    setTheatresState((prev) =>
      prev.map((theatre) => {
        if (theatre.id !== theatreId) return theatre;
        return {
          ...theatre,
          halls: theatre.halls.map((hall) => {
            if (hall.id !== hallId) return hall;
            return {
              ...hall,
              movieAssigned: movieTitle === "none" ? null : movieTitle,
              timings:
                movieTitle === "none"
                  ? []
                  : hall.timings.length
                  ? hall.timings
                  : ["10:30 AM", "02:15 PM", "06:30 PM", "10:00 PM"],
            };
          }),
        };
      })
    );
    toast.success("Hall movie assignment updated!");
  };

  const handleAddHall = (theatreId: string) => {
    const newHallId = `H${Date.now().toString().slice(-4)}`;
    setTheatresState((prev) =>
      prev.map((theatre) => {
        if (theatre.id !== theatreId) return theatre;
        return {
          ...theatre,
          halls: [
            ...theatre.halls,
            { id: newHallId, name: `Hall ${theatre.halls.length + 1}`, movieAssigned: null, timings: [] },
          ],
        };
      })
    );
    toast.success("New Hall added!");
  };

  const handleDeleteHall = (theatreId: string, hallId: string) => {
    if (confirm("Are you sure you want to delete this hall?")) {
      setTheatresState((prev) =>
        prev.map((theatre) => {
          if (theatre.id !== theatreId) return theatre;
          return {
            ...theatre,
            halls: theatre.halls.filter((h) => h.id !== hallId),
          };
        })
      );
      toast.success("Hall deleted.");
    }
  };

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
            <h2>Recent Activity</h2>
            <ul className={styles.activityList}>
              {recentActivity.map((activity, index) => (
                <li key={index} className={styles.activityItem}>
                  {activity.text}
                  <span suppressHydrationWarning>{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ===== THEATRES & HALLS TAB ===== */}
      {activeTab === "theatres" && (
        <div className={`${styles.contentGrid} ${styles.fullWidth}`}>
          <div className={styles.section}>
            <h2>Manage Theatres &amp; Hall Allocations</h2>
            
            {theatresState.map((theatre) => (
              <div key={theatre.id} className={styles.theatreCard}>
                <div className={styles.theatreCardHeader}>
                  <h3>{theatre.name}</h3>
                  <button className={styles.addBtn} onClick={() => handleAddHall(theatre.id)}>
                    + Add Hall
                  </button>
                </div>
                
                <div className={styles.hallsGrid}>
                  {theatre.halls.map((hall) => (
                    <div key={hall.id} className={styles.hallCard}>
                      <div className={styles.hallCardHeader}>
                        <h4>{hall.name}</h4>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteHall(theatre.id, hall.id)}
                          title="Delete Hall"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className={styles.hallControl}>
                        <label>Assigned Movie (1 per Hall)</label>
                        <select 
                          className={styles.movieSelect}
                          value={hall.movieAssigned || "none"}
                          onChange={(e) => handleAssignMovie(theatre.id, hall.id, e.target.value)}
                        >
                          <option value="none">-- Unassigned --</option>
                          {movies.map((m) => (
                            <option key={m.id} value={m.title}>
                              {m.title} ({m.language || "Tamil"})
                            </option>
                          ))}
                        </select>
                        {!hall.movieAssigned && (
                          <span className={styles.emptyMovie}>Hall is currently vacant.</span>
                        )}
                      </div>

                      <div className={styles.hallControl}>
                        <label>Show Timings</label>
                        {hall.timings.length > 0 ? (
                          <div className={styles.timingsList}>
                            {hall.timings.map((time, i) => (
                              <span key={i} className={styles.timingBadge}>{time}</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#666' }}>No timings set</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {theatre.halls.length === 0 && (
                    <div style={{ color: "#888", fontSize: "0.9rem" }}>No halls configured for this theatre.</div>
                  )}
                </div>
              </div>
            ))}

          </div>
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
