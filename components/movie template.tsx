import React from "react";

interface MovieProps {
  movie: {
    title: string;
    language: string;
    genre: string;
    image: string;
  };
}

const MovieTemplate: React.FC<MovieProps> = ({ movie }) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", width: "200px" }}>
      <img src={movie.image} alt={movie.title} width="100%" />
      <h3>{movie.title}</h3>
      <p>{movie.language}</p>
      <p>{movie.genre}</p>
    </div>
  );
};

export default MovieTemplate;