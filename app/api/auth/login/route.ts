import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
  }

  // In a real application, you would verify the user's credentials.
  // Here, we'll just simulate a successful login.

  const user = {
    id: '1',
    name: 'Test User',
    email,
    role: 'user',
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    credits: 10,
    createdAt: new Date().toISOString(),
  };

  const token = 'mock-jwt-token';
  const expiresIn = 3600; // 1 hour

  return NextResponse.json({ user, token, expiresIn });
}
