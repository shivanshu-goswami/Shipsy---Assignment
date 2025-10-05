// Import NextResponse from 'next/server'.
import { NextResponse } from 'next/server';
// Import the prisma client from your lib folder.
import prisma from '@/lib/prisma';
// Import the bcrypt library for password verification.
import bcrypt from 'bcrypt';
// Import jsonwebtoken for creating JWT tokens.
import jwt from 'jsonwebtoken';

// Create and export an async function named POST that accepts a request object.
export async function POST(request) {
  try {
    // Parse the JSON body of the request to get the email and password.
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use prisma to find a unique user by their email.
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // If no user is found, return a JSON response with an "Invalid credentials" error and a 401 status.
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // If a user is found, compare the provided password with the stored hash using bcrypt.compare.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the passwords do not match, return a 401 "Invalid credentials" error.
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // If the passwords match, create a JWT payload containing the user's id.
    // Sign the token using a secret from your .env file, with an expiration of '1d'.
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Return the token and user info in a JSON response.
    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
