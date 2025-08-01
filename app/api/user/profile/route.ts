import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const { name, email, bio } = await request.json();

  // In a real application, you would update the user's profile in the database.
  // Here, we'll just simulate a successful update.

  const updatedUser = {
    id: '1',
    name,
    email,
    bio,
    role: 'user',
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    credits: 10,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(updatedUser);
}
