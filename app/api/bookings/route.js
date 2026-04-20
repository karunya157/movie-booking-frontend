import { readDB, writeDB } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    const db = readDB();

    if (!db.bookings) {
      db.bookings = [];
      writeDB(db);
    }

    if (role === "admin") {
      return Response.json(db.bookings);
    }

    if (userId) {
      const userBookings = db.bookings.filter(b => b.userId.toString() === userId.toString());
      return Response.json(userBookings);
    }

    return Response.json({ message: "UserId or Admin role required" }, { status: 400 });
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, movieId, movieTitle, seats, date, time, amount, method, image } = body;

    const db = readDB();

    if (!db.bookings) {
      db.bookings = [];
    }

    const newBooking = {
      id: "B" + Date.now().toString().slice(-6),
      userId,
      movieId,
      movieTitle,
      seats,
      date,
      time,
      amount,
      method,
      image: image || "/placeholder-movie.png",
      status: method === "cash" ? "Reserved" : "Confirmed", // Reserved for cash, Confirmed for others
      createdAt: new Date().toISOString(),
    };

    db.bookings.push(newBooking);
    writeDB(db);

    return Response.json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
