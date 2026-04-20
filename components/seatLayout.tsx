import React, { useState } from "react";

const SeatLayout: React.FC = () => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const toggleSeat = (seat: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  return (
    <div>
      {[...Array(25)].map((_, i) => (
        <button key={i} onClick={() => toggleSeat(i)}>
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default SeatLayout;