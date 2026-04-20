import { readDB, writeDB } from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  const { name, email, password, role } = body;

  const db = readDB();

  // ✅ safety check
  if (!db.users) {
    db.users = [];
  }

  // check if user already exists (case-insensitive)
  const userExists = db.users.find(user => user.email.toLowerCase() === email.toLowerCase());

  if (userExists) {
    return Response.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role,
  };

  db.users.push(newUser);
  writeDB(db);

  return Response.json({ message: "User created successfully" });
}