import React from "react";
import Link from "next/link";

const Home: React.FC = () => {
  return (
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center",
      textAlign: "center",
      background: "radial-gradient(circle at center, #1a1a2e 0%, #0f0f0f 100%)",
      padding: "80px 20px"
    }}>
      <div className="fade-in" style={{ maxWidth: "800px" }}>
        <h1 style={{ 
          fontSize: "4rem", 
          fontWeight: "900", 
          marginBottom: "20px",
          background: "linear-gradient(to right, #ffffff, #888888)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Your Ticket to the <br/> Big Screen
        </h1>
        <p style={{ 
          fontSize: "1.25rem", 
          color: "#a0a0a0", 
          marginBottom: "40px",
          lineHeight: "1.8"
        }}>
          Experience cinema like never before. Browse the latest blockbusters, <br/>
          book your favorite seats, and enjoy the ultimate movie night.
        </p>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <Link href="/guest">
            <button style={{ padding: "15px 40px", fontSize: "1.1rem" }}>Browse Movies</button>
          </Link>
          <Link href="/login">
            <button style={{ 
              padding: "15px 40px", 
              fontSize: "1.1rem", 
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white"
            }}>
              Login
            </button>
          </Link>
        </div>
      </div>

      
      <div style={{ 
        marginTop: "100px", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "40px",
        width: "100%",
        maxWidth: "1100px"
      }}>
        <div style={featureCardStyle}>
          <h3>Easy Booking</h3>
          <p>Skip the queues with our fast and secure online booking system.</p>
        </div>
        <div style={featureCardStyle}>
          <h3>Best Seats</h3>
          <p>Pick your favorite spot in the house with our interactive seat map.</p>
        </div>
        <div style={featureCardStyle}>
          <h3>Exclusive Offers</h3>
          <p>Get access to special discounts and early bird tickets.</p>
        </div>
      </div>
    </main>
  );
};

const featureCardStyle: React.CSSProperties = {
  padding: "40px",
  background: "rgba(255,255,255,0.03)",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.05)",
  textAlign: "center"
};

export default Home;