export async function GET() {
  try {
    const res = await fetch("http://localhost:8080/users", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch users from backend");
    }
    const users = await res.json();
    return Response.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, role, name, email } = body;

    if (!id) {
      return Response.json({ message: "User ID is required" }, { status: 400 });
    }

    // Fetch existing user first
    const getRes = await fetch(`http://localhost:8080/users/${id}`, { cache: "no-store" });
    if (!getRes.ok) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const existingUser = await getRes.json();

    const updatedUser = {
      ...existingUser,
      name: name !== undefined ? name : existingUser.name,
      email: email !== undefined ? email : existingUser.email,
      role: role !== undefined ? role.toLowerCase() : existingUser.role,
    };

    const updateRes = await fetch(`http://localhost:8080/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (!updateRes.ok) {
      throw new Error("Failed to update user in backend");
    }

    const saved = await updateRes.json();
    return Response.json({ message: "User updated successfully", user: saved });
  } catch (error) {
    console.error("PUT /api/users error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ message: "User ID is required" }, { status: 400 });
    }

    const delRes = await fetch(`http://localhost:8080/users/${id}`, {
      method: "DELETE",
    });

    if (!delRes.ok) {
      throw new Error("Failed to delete user in backend");
    }

    return Response.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

