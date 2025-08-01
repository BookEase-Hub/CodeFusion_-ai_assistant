import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ message: 'Missing email' }, { status: 400 });
  }

  // In a real application, you would send a password reset email.
  // Here, we'll just simulate a successful request.

  return NextResponse.json({ message: 'Password reset email sent' });
}
