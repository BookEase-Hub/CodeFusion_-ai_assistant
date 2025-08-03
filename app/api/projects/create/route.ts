import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const project = await request.json()

  // In a real app, you'd get the userId from the session
  // const { userId } = auth()
  // const newProject = await db.insert(projectsTable).values({ ...project, userId }).returning()

  console.log("New project created (mock):", project)

  return NextResponse.json({ message: "Project created successfully", project })
}
