import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Missing name, email, or password' }, { status: 400 });
  }

  // In a real application, you would save the user to a database.
  // Here, we'll just simulate a successful signup.

  const user = {
    id: '1',
    name,
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
