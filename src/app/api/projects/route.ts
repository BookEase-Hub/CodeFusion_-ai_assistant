import { NextResponse } from "next/server"

// In-memory store for projects
const projects = [
  {
    id: "proj_cloud_1",
    name: "Cloud Project Alpha",
    description: "A project synced from the cloud.",
    primaryLanguage: "TypeScript",
    template: "web-app",
    userId: "mock_user_1",
  },
  {
    id: "proj_cloud_2",
    name: "Cloud Project Beta",
    description: "Another project from the cloud.",
    primaryLanguage: "Python",
    template: "api",
    userId: "mock_user_1",
  },
]

export async function GET(request: Request) {
  // In a real app, you'd get the userId from the session
  // const { userId } = auth()
  // const userProjects = await db.select().from(projectsTable).where(eq(projectsTable.userId, userId))
  return NextResponse.json(projects)
}
