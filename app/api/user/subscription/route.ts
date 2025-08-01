import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const { plan } = await request.json();

  // In a real application, you would update the user's subscription in the database.
  // Here, we'll just simulate a successful update.

  const updatedUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    subscriptionPlan: plan,
    subscriptionStatus: 'active',
    credits: 10,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(updatedUser);
}
