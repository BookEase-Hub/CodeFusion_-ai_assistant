import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const { avatar } = await request.json();

  // In a real application, you would update the user's avatar in the database.
  // Here, we'll just simulate a successful update.

  const updatedUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar,
    role: 'user',
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    credits: 10,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(updatedUser);
}
