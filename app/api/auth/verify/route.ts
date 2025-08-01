import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { headers } = request;
  const authHeader = headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Missing or invalid token' }, { status: 401 });
  }

  // In a real application, you would verify the token.
  // Here, we'll just simulate a successful verification.

  const user = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    credits: 10,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ user });
}
