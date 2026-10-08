export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return Response.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const usersRes = await fetch("http://localhost:8080/users", { cache: "no-store" });
    const users = await usersRes.json();

    const userExists = users.find(
      (user) => user.email && user.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return Response.json(
        { message: "User already exists with this email address" },
        { status: 400 }
      );
    }

    // User Rule: Public Signup is STRICTLY Customer-only.
    // Admin access can ONLY be granted by existing Admin in the Admin Console.
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "customer",
    };

    const res = await fetch("http://localhost:8080/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!res.ok) throw new Error("Failed to create user in backend");

    return Response.json({
      message: "Customer account created successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: "customer" },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const usersRes = await fetch("http://localhost:8080/users", { cache: "no-store" });
    const users = await usersRes.json();
    const adminExists = users.some(
      (user) => user.role && user.role.toLowerCase() === "admin"
    );
    return Response.json({ adminExists });
  } catch {
    return Response.json({ adminExists: false });
  }
}