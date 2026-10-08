import { defaultMoviesList } from "@/data/movies";

export async function GET() {
  try {
    let backendMovies = [];
    try {
      const res = await fetch("http://localhost:8080/movies", { cache: "no-store" });
      if (res.ok) {
        backendMovies = await res.json();
      }
    } catch (e) {
      // Spring boot backend offline or slow, continue with default movies
    }

    // Start with all 26 multilingual blockbusters (Tamil, Malayalam, Telugu, Hindi)
    const merged = [...defaultMoviesList];

    if (Array.isArray(backendMovies) && backendMovies.length > 0) {
      backendMovies.forEach((bm) => {
        const idx = merged.findIndex(
          (m) => m.title?.trim().toLowerCase() === bm.title?.trim().toLowerCase() || m.id === bm.id
        );
        if (idx >= 0) {
          merged[idx] = {
            ...merged[idx],
            ...bm,
            image: merged[idx].image || bm.image,
            trailer: merged[idx].trailer || bm.trailer,
          };
        } else {
          merged.push(bm);
        }
      });
    }

    return Response.json(merged);
  } catch (error) {
    return Response.json(defaultMoviesList);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, genre, status, image, duration, language } = body;
    
    const newMovie = { 
      id: Date.now(),
      title, 
      genre, 
      status: status || "Active",
      image: image || "https://via.placeholder.com/300x450.png?text=No+Image",
      rating: "N/A", 
      duration: duration || "150 min", 
      language: language || "Tamil"
    };
    
    try {
      await fetch("http://localhost:8080/movies", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
      });
    } catch (e) {
      // Fallback
    }
    
    return Response.json({ message: "Movie added", movie: newMovie });
  } catch {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, title, genre, status, image, duration, language } = body;
    
    const updatedMovie = {
      id,
      title,
      genre,
      status: status || "Active",
      image: image || "/leo.jpg",
      duration: duration || "150 min",
      language: language || "Tamil"
    };

    try {
      await fetch(`http://localhost:8080/movies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovie)
      });
    } catch (e) {
      // Fallback
    }

    return Response.json({ message: "Movie updated", movie: updatedMovie });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id"));
    
    try {
      await fetch(`http://localhost:8080/movies/${id}`, { method: 'DELETE' });
    } catch (e) {
      // Fallback
    }

    return Response.json({ message: "Movie deleted", id });
  } catch {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
