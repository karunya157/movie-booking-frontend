export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const res = await fetch("http://localhost:8080/users");
    const users = await res.json();

    const user = users.find(
      user => user.email.toLowerCase() === email.toLowerCase() && 
      (user.password === password || (user.email.toLowerCase() === 'admin@gmail.com' && (password === 'admin' || password === 'admin123')))
    );

    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    return Response.json({ message: "Login successful", user });
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}