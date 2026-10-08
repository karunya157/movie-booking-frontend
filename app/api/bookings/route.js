export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    let url = "http://localhost:8080/bookings";
    if (userId) {
      url += `?userId=${userId}`;
    }
    
    const res = await fetch(url);
    const bookings = await res.json();
    
    // Sort by id descending like before? The old code returned the raw array.
    return Response.json(bookings);
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newBooking = {
      ...body,
      id: "B" + Math.floor(100000 + Math.random() * 900000), // Random Booking ID
      createdAt: new Date().toISOString()
    };
    
    const res = await fetch("http://localhost:8080/bookings", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    });
    
    const created = await res.json();
    return Response.json({ message: "Booking confirmed", booking: created });
  } catch {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    
    const res = await fetch(`http://localhost:8080/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const updated = await res.json();
    return Response.json({ message: "Booking updated", booking: updated });
  } catch {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    await fetch(`http://localhost:8080/bookings/${id}`, { method: 'DELETE' });
    return Response.json({ message: "Booking cancelled" });
  } catch {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    let newStatus = "Cancelled (Refunded)";
    try {
      const body = await req.json();
      if (body?.status) newStatus = body.status;
    } catch {
      // Body is optional
    }
    
    // Fetch existing booking
    const getRes = await fetch("http://localhost:8080/bookings/" + id);
    if (!getRes.ok) {
      return Response.json({ message: "Not found" }, { status: 404 });
    }
    const booking = await getRes.json();
    booking.status = newStatus;
    
    // Update it
    const res = await fetch("http://localhost:8080/bookings/" + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    
    const updated = await res.json();
    return Response.json({ message: "Booking cancelled and refunded", booking: updated });
  } catch {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}

