"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

/* ===== Interfaces ===== */
interface Movie {
  id: number;
  title: string;
  genre: string;
  status: string;
}

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
}

interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"movies" | "theatres" | "profile">("movies");

  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: "Admin User",
    email: "admin@example.com",
    phone: "+1 234 567 8900",
    role: "Super Admin",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<AdminProfile>(adminProfile);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  React.useEffect(() => {
    // Fetch Movies and Bookings for Stats
    const fetchData = async () => {
      try {
        // Fetch movies list or use default
        setMovies([
          { id: 1, title: "Dune: Part Two", genre: "Sci-Fi", status: "Active" },
          { id: 2, title: "Godzilla x Kong", genre: "Action", status: "Active" },
          { id: 3, title: "Kung Fu Panda 4", genre: "Animation", status: "Active" },
          { id: 4, title: "Civil War", genre: "Action", status: "Active" },
          { id: 5, title: "The Batman", genre: "Action", status: "Active" },
          { id: 6, title: "Oppenheimer", genre: "Drama", status: "Active" },
        ]);

        // Fetch Real Bookings for Admin
        const resBookings = await fetch("/api/bookings?role=admin");
        const bookingsData = await resBookings.json();
        if (resBookings.ok) {
          setBookingsCount(bookingsData.length);
          const totalRev = bookingsData.reduce((acc: number, b: any) => acc + b.amount, 0);
          setRevenue(totalRev);
          
          // Latest 3 bookings as activity
          const latest = bookingsData.slice(-3).reverse().map((b: any) => ({
             text: `New booking for ${b.movieTitle}`,
             time: new Date(b.createdAt).toLocaleTimeString()
          }));
          setRecentActivity(latest);
        }
      } catch (error) {
        console.error("Admin Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const [theatresState, setTheatresState] = useState<Theatre[]>([
    {
      id: "T1",
      name: "AMC Empire 25",
      halls: [
        { id: "H101", name: "Hall 1", movieAssigned: "Dune: Part Two", timings: ["10:30 AM", "01:15 PM", "04:45 PM"] },
        { id: "H102", name: "Hall 2 (IMAX)", movieAssigned: "Oppenheimer", timings: ["12:00 PM", "04:00 PM", "08:00 PM"] },
        { id: "H103", name: "Hall 3", movieAssigned: null, timings: [] },
      ]
    },
    {
      id: "T2",
      name: "Regal Union Square",
      halls: [
        { id: "H201", name: "Screen 1 (4DX)", movieAssigned: "Godzilla x Kong", timings: ["11:00 AM", "02:30 PM", "06:00 PM"] },
        { id: "H202", name: "Screen 2", movieAssigned: "Kung Fu Panda 4", timings: ["10:00 AM", "12:30 PM", "03:00 PM"] },
      ]
    }
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<MovieFormData>({ id: null, title: "", genre: "", status: "Active" });

  const handleLogout = () => {
    router.push("/login");
  };

  const handleSaveProfile = () => {
    setAdminProfile(tempProfile);
    setIsEditingProfile(false);
    alert("Profile updated successfully!");
  };

  /* ===== Movies CRUD Logic ===== */
  
  const openAddModal = () => {
    setFormData({ id: null, title: "", genre: "", status: "Active" });
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setFormData({ id: movie.id, title: movie.title, genre: movie.genre, status: movie.status });
    setIsModalOpen(true);
  };

  const handleDeleteMovie = (id: number) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      const movieToDelete = movies.find(m => m.id === id);
      setMovies(movies.filter((m) => m.id !== id));
      
      // Cleanup: If a theatre hall was playing this movie, unassign it.
      if (movieToDelete) {
        setTheatres(prev => prev.map(theatre => ({
          ...theatre,
          halls: theatre.halls.map(hall => {
            if (hall.movieAssigned === movieToDelete.title) {
              return { ...hall, movieAssigned: null, timings: [] };
            }
            return hall;
          })
        })));
      }
    }
  };

  const handleSaveMovie = () => {
    if (!formData.title.trim() || !formData.genre.trim()) {
      alert("Title and Genre are required.");
      return;
    }

    if (formData.id) {
      // Update logic
      const oldTitle = movies.find(m => m.id === formData.id)?.title;
      setMovies(movies.map((m) => (m.id === formData.id ? { ...m, title: formData.title, genre: formData.genre, status: formData.status } : m)));
      
      // Sync names in halls if title changed
      if (oldTitle && oldTitle !== formData.title) {
        setTheatres(prev => prev.map(theatre => ({
          ...theatre,
          halls: theatre.halls.map(hall => {
            if (hall.movieAssigned === oldTitle) {
              return { ...hall, movieAssigned: formData.title };
            }
            return hall;
          })
        })));
      }

    } else {
      // Add logic
      const newId = movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1;
      setMovies([...movies, { id: newId, title: formData.title, genre: formData.genre, status: formData.status }]);
    }
    
    setIsModalOpen(false);
  };


  /* ===== Theatres Logic ===== */
  
  const handleAssignMovie = (theatreId: string, hallId: string, movieTitle: string) => {
    setTheatres((prev) => 
      prev.map((theatre) => {
        if (theatre.id !== theatreId) return theatre;
        return {
          ...theatre,
          halls: theatre.halls.map((hall) => {
            if (hall.id !== hallId) return hall;
            return {
              ...hall,
              movieAssigned: movieTitle === "none" ? null : movieTitle,
              timings: movieTitle === "none" ? [] : (hall.timings.length ? hall.timings : ["10:00 AM", "01:00 PM"]) 
            };
          })
        };
      })
    );
  };

  const handleAddHall = (theatreId: string) => {
    const newHallId = `H${Date.now().toString().slice(-4)}`;
    setTheatres((prev) => 
      prev.map((theatre) => {
        if (theatre.id !== theatreId) return theatre;
        return {
          ...theatre,
          halls: [
            ...theatre.halls,
            { id: newHallId, name: `New Hall`, movieAssigned: null, timings: [] }
          ]
        };
      })
    );
  };

  return (
    <div className={styles.adminWrapper}>
      <header className={styles.header}>
        <h1>Admin Console</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Movies</div>
          <div className={styles.statValue}>{movies.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Theatres</div>
          <div className={styles.statValue}>{theatres.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Bookings</div>
          <div className={styles.statValue}>{bookingsCount.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Revenue</div>
          <div className={styles.statValue}>₹{revenue.toLocaleString()}</div>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "movies" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          Manage Movies
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "theatres" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("theatres")}
        >
          Manage Theatres &amp; Halls
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "profile" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Personal Details
        </button>
      </div>

      {/* ===== MOVIES TAB ===== */}
      {activeTab === "movies" && (
        <div className={styles.contentGrid}>
          <div className={styles.section}>
            <h2>
              Movies Roster
              <button className={styles.addBtn} onClick={openAddModal}>+ Add Movie</button>
            </h2>
            <table className={styles.movieTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id}>
                    <td>{movie.title}</td>
                    <td>{movie.genre}</td>
                    <td>{movie.status}</td>
                    <td className={styles.actionBtns}>
                      <button className={styles.editBtn} onClick={() => openEditModal(movie)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteMovie(movie.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {movies.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
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
                  <span>{activity.time}</span>
                </li>
              ))}
              {recentActivity.length === 0 && (
                <li className={styles.activityItem} style={{ color: "#888" }}>
                  No recent bookings.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* ===== THEATRES & HALLS TAB ===== */}
      {activeTab === "theatres" && (
        <div className={`${styles.contentGrid} ${styles.fullWidth}`}>
          <div className={styles.section}>
            <h2>
              Theatres &amp; Halls Configuration
              <button className={styles.addBtn}>+ Add Theatre</button>
            </h2>
            
            {theatresState.map((theatre) => (
              <div key={theatre.id} className={styles.theatreCard}>
                <div className={styles.theatreCardHeader}>
                  <h3>{theatre.name}</h3>
                  <button className={styles.addBtn} onClick={() => handleAddHall(theatre.id)}>+ Add Hall</button>
                </div>
                
                <div className={styles.hallsGrid}>
                  {theatre.halls.map((hall) => (
                    <div key={hall.id} className={styles.hallCard}>
                      <div className={styles.hallCardHeader}>
                        <h4>{hall.name}</h4>
                        <button className={styles.deleteBtn} title="Delete Hall">✕</button>
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
                            <option key={m.id} value={m.title}>{m.title}</option>
                          ))}
                        </select>
                        {!hall.movieAssigned && <span className={styles.emptyMovie}>Hall is currently vacant.</span>}
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
                          <span style={{ fontSize: '0.85rem', color: '#555' }}>No timings set</span>
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

      {/* ===== MODAL ===== */}
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
                placeholder="e.g. Action, Sci-Fi"
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
