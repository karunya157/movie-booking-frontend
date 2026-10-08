import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return Response.json({ error: "No files received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    
    const uploadPath = path.join(uploadDir, filename);
    await fs.writeFile(uploadPath, buffer);
    
    return Response.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
