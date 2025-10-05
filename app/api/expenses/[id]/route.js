// Import NextResponse from 'next/server', the prisma client, and jsonwebtoken.
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Import the same helper function from the other expense route to get the user ID from the token.
function getUserIdFromToken(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId; // Return the user ID
  } catch {
    return null;
  }
}

// GET - Fetch a single expense by ID
export async function GET(request, { params }) {
  try {
    // Get the user ID from the token. If it fails, return a 401 error.
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the expense ID from the params.
    const { id } = await params;
    const expenseId = parseInt(id);

    // Validate ID
    if (isNaN(expenseId)) {
      return NextResponse.json(
        { error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    // Fetch the expense from database
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // If expense not found
    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Verify the expense belongs to the authenticated user
    if (expense.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only access your own expenses' },
        { status: 403 }
      );
    }

    // Calculate and add total_amount
    const total_amount = expense.base_amount + (expense.base_amount * expense.tax_rate);

    // Return the expense
    return NextResponse.json(
      { 
        expense: {
          ...expense,
          total_amount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create and export an async function named PUT for updating an expense. It accepts request and a params object.
export async function PUT(request, { params }) {
  try {
    // Get the user ID from the token. If it fails, return a 401 error.
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the expense ID from the params.
    const { id } = await params;
    const expenseId = parseInt(id);

    // Validate ID
    if (isNaN(expenseId)) {
      return NextResponse.json(
        { error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    // Get the new data from the request's JSON body.
    const { description, base_amount, tax_rate, category, payment_status } = await request.json();

    // Validate category if provided
    if (category) {
      const validCategories = ['Food', 'Travel', 'Office', 'Other'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate payment_status if provided
    if (payment_status) {
      const validPaymentStatuses = ['Paid', 'Pending', 'Reimbursable', 'Recurring'];
      if (!validPaymentStatuses.includes(payment_status)) {
        return NextResponse.json(
          { error: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Build update data object (only include provided fields)
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (base_amount !== undefined) updateData.base_amount = parseFloat(base_amount);
    if (tax_rate !== undefined) updateData.tax_rate = parseFloat(tax_rate);
    if (category !== undefined) updateData.category = category;
    if (payment_status !== undefined) updateData.payment_status = payment_status;

    // Use prisma to update the expense, but include a 'where' clause to ensure BOTH the expense ID matches AND the userId matches the current user's ID.
    const updatedExpense = await prisma.expense.updateMany({
      where: { 
        id: expenseId,
        userId: userId
      },
      data: updateData
    });

    // If no expense was updated (either not found or doesn't belong to user)
    if (updatedExpense.count === 0) {
      return NextResponse.json(
        { error: 'Expense not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    // Fetch the updated expense to return it
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Calculate and add total_amount
    const total_amount = expense.base_amount + (expense.base_amount * expense.tax_rate);

    // Return the updated expense as JSON.
    return NextResponse.json(
      {
        message: 'Expense updated successfully',
        expense: {
          ...expense,
          total_amount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create and export an async function named DELETE for deleting an expense.
export async function DELETE(request, { params }) {
  try {
    // Get the user ID from the token.
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the expense ID from the params.
    const { id } = await params;
    const expenseId = parseInt(id);

    // Validate ID
    if (isNaN(expenseId)) {
      return NextResponse.json(
        { error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    // Use prisma to find the unique expense first to verify it belongs to the current user.
    const existingExpense = await prisma.expense.findUnique({
      where: { id: expenseId }
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // If the expense's userId does not match the token's userId, return a 403 Forbidden error.
    if (existingExpense.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // If it does match, use prisma to delete the expense by its ID.
    await prisma.expense.delete({
      where: { id: expenseId }
    });

    // Return a success response with a 204 status code (No Content).
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
