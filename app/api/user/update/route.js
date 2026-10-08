export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, email, password } = body;

    // First fetch the existing user
    const getRes = await fetch(`http://localhost:8080/users/${id}`);
    if (!getRes.ok) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
    const existingUser = await getRes.json();

    // Update user details
    const updatedUser = {
      ...existingUser,
      name: name || existingUser.name,
      email: email || existingUser.email,
      password: password || existingUser.password,
    };

    const res = await fetch(`http://localhost:8080/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });

    const savedUser = await res.json();
    return Response.json({ message: "Profile updated successfully", user: savedUser });
  } catch (error) {
    console.error("Update Error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
