// Import NextResponse from 'next/server'.
import { NextResponse } from 'next/server';
// Import the prisma client from your lib folder.
import prisma from '@/lib/prisma';
// Import the bcrypt library for password hashing.
import bcrypt from 'bcrypt';

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

    // Use prisma to find if a user with the given email already exists.
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    // If a user is found, return a JSON response with an error message and a 400 status code.
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // If the user does not exist, hash the password using bcrypt with a salt of 10.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use prisma to create a new user with the provided email and the newly hashed password.
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // Return the new user object in a JSON response with a 201 status code.
    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        message: 'User registered successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
