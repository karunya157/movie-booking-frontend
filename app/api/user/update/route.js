import { readDB, writeDB } from "@/lib/db";

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, email, password } = body;

    const db = readDB();

    const userIndex = db.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Update user details
    const updatedUser = {
      ...db.users[userIndex],
      name: name || db.users[userIndex].name,
      email: email || db.users[userIndex].email,
      password: password || db.users[userIndex].password,
    };

    db.users[userIndex] = updatedUser;
    writeDB(db);

    return Response.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update Error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
