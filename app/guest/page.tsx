import React from "react";
import Link from "next/link";

const movieList = [
  {
    id: 1,
    title: "Dune: Part Two",
    language: "English",
    genre: "Sci-Fi / Adventure",
    image: "/dune.png",
    rating: "8.8"
  },
  {
    id: 2,
    title: "Leo",
    language: "Tamil",
    genre: "Action / Thriller",
    image: "/leo.png",
    rating: "7.9"
  },
  {
    id: 3,
    title: "Godzilla x Kong",
    language: "English",
    genre: "Action / Sci-Fi",
    image: "/godzilla.png",
    rating: "7.1"
  },
  {
    id: 4,
    title: "Jawan",
    language: "Hindi",
    genre: "Action / Drama",
    image: "/jawan.png",
    rating: "8.2"
  },
];

const BrowseMovies = () => {
  return (
    <main style={{ padding: "60px 40px", background: "#0a0a0a" }}>
      <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Now Showing</h1>
          <p style={{ color: "#a0a0a0" }}>Check out the latest releases and pick your showtime.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select style={{ width: "auto", margin: 0 }}>
            <option>All Genres</option>
            <option>Action</option>
            <option>Sci-Fi</option>
          </select>
        </div>
      </div>

      <div className="grid" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", 
        gap: "40px" 
      }}>
        {movieList.map((movie) => (
          <div key={movie.id} style={movieCardStyle}>
            <div style={imageWrapperStyle}>
              <img
                src={movie.image}
                alt={movie.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
              />
              <div style={ratingBadgeStyle}>★ {movie.rating}</div>
            </div>
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{movie.title}</h3>
              <p style={{ color: "#a0a0a0", fontSize: "0.9rem", marginBottom: "20px" }}>{movie.language} • {movie.genre}</p>
              <Link href="/login">
                <button style={{ width: "100%", padding: "12px" }}>Book Tickets</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

const movieCardStyle: React.CSSProperties = {
  background: "#161616",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.05)",
  transition: "all 0.3s ease",
};

const imageWrapperStyle: React.CSSProperties = {
  position: "relative",
  aspectRatio: "2/3",
  overflow: "hidden"
};

const ratingBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: "15px",
  right: "15px",
  background: "rgba(0,0,0,0.8)",
  backdropFilter: "blur(10px)",
  padding: "5px 12px",
  borderRadius: "20px",
  color: "#ffcc00",
  fontWeight: "700",
  fontSize: "0.85rem",
  border: "1px solid rgba(255,255,255,0.1)"
};

export default BrowseMovies;