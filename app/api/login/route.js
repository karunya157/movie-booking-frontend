import { readDB } from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  const db = readDB(); 

  const user = db.users.find(
    user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );

  if (!user) {
    return Response.json({ message: "Invalid credentials" }, { status: 401 });
  }

  return Response.json({ message: "Login successful", user });
}