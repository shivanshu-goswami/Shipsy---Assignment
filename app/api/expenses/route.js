// Import NextResponse and NextRequest from 'next/server'.
import { NextResponse } from 'next/server';
// Import the prisma client.
import prisma from '@/lib/prisma';
// Import jsonwebtoken to verify tokens.
import jwt from 'jsonwebtoken';

// Create a helper function to get the user ID from the Authorization header's bearer token.
// It should verify the token using the JWT_SECRET and return the decoded user ID.
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

// Create and export an async function named POST for creating a new expense.
export async function POST(request) {
  try {
    // Get the user ID from the request token using the helper function. If it fails, return a 401 Unauthorized error.
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body for description, base_amount, tax_rate, category, and payment_status.
    const { description, base_amount, tax_rate, category, payment_status } = await request.json();

    // Validate required fields
    if (!description || base_amount === undefined || tax_rate === undefined || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: description, base_amount, tax_rate, category' },
        { status: 400 }
      );
    }

    // Validate category enum
    const validCategories = ['Food', 'Travel', 'Office', 'Other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate payment_status enum
    const validPaymentStatuses = ['Paid', 'Pending', 'Reimbursable', 'Recurring'];
    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return NextResponse.json(
        { error: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Use prisma to create a new expense, connecting it to the user's id.
    // Temporarily support both old (is_reimbursed) and new (payment_status) schema
    const expenseData = {
      description,
      base_amount: parseFloat(base_amount),
      tax_rate: parseFloat(tax_rate),
      category,
      userId: userId
    };
    
    // Try to use payment_status (new schema), fallback to is_reimbursed (old schema)
    try {
      expenseData.payment_status = payment_status || 'Pending';
      const expense = await prisma.expense.create({
        data: expenseData,
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });

      // Calculate total_amount
      const total_amount = expense.base_amount + (expense.base_amount * expense.tax_rate);

      // Return the new expense as JSON with a 201 status code.
      return NextResponse.json(
        {
          message: 'Expense created successfully',
          expense: {
            ...expense,
            total_amount,
            // Add payment_status mapping for old schema
            payment_status: expense.payment_status || (expense.is_reimbursed ? 'Paid' : 'Pending')
          }
        },
        { status: 201 }
      );
    } catch (schemaError) {
      // If payment_status field doesn't exist yet, try with old schema
      if (schemaError.message?.includes('payment_status')) {
        delete expenseData.payment_status;
        // Map payment_status to is_reimbursed for old schema
        expenseData.is_reimbursed = payment_status === 'Paid';
        
        const expense = await prisma.expense.create({
          data: expenseData,
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        });

        const total_amount = expense.base_amount + (expense.base_amount * expense.tax_rate);

        return NextResponse.json(
          {
            message: 'Expense created successfully',
            expense: {
              ...expense,
              total_amount,
              payment_status: expense.is_reimbursed ? 'Paid' : 'Pending'
            }
          },
          { status: 201 }
        );
      }
      throw schemaError;
    }
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create and export an async function named GET for listing expenses.
export async function GET(request) {
  try {
    // Get the user ID from the request token. If it fails, return a 401 error.
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the URL search parameters for pagination (page, limit) and filtering (category, payment_status).
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const payment_status = searchParams.get('payment_status');
    const search = searchParams.get('search'); // Search query
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // Sort field
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // Sort direction
    
    // Set default values for page (1) and limit (10).
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    // Construct a prisma query 'where' clause to filter by the user's ID and, if provided, the category or payment_status.
    const where = {
      userId: userId
    };

    if (category) {
      where.category = category;
    }

    // Try to filter by payment_status (new schema) or is_reimbursed (old schema)
    if (payment_status) {
      try {
        where.payment_status = payment_status;
      } catch {
        // Fallback to old schema
        where.is_reimbursed = payment_status === 'Paid';
      }
    }

    // Add search functionality - search in description field
    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive' // Case-insensitive search
      };
    }

    // Validate sortBy field
    const validSortFields = ['createdAt', 'base_amount', 'tax_rate', 'description', 'category'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    // Validate sortOrder
    const finalSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    // Use 'skip' and 'take' in the prisma query for pagination.
    const skip = (page - 1) * limit;
    const take = limit;

    // Fetch the expenses from the database.
    const expenses = await prisma.expense.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        [finalSortBy]: finalSortOrder
      }
    });

    // Get total count for pagination metadata
    const totalCount = await prisma.expense.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Map over the fetched expenses to add the calculated 'total_amount' field and payment_status mapping
    const expensesWithTotal = expenses.map(expense => ({
      ...expense,
      total_amount: expense.base_amount + (expense.base_amount * expense.tax_rate),
      // Map payment_status for old schema compatibility
      payment_status: expense.payment_status || (expense.is_reimbursed ? 'Paid' : 'Pending')
    }));

    // Return the modified list of expenses as JSON with complete pagination metadata.
    return NextResponse.json(
      {
        expenses: expensesWithTotal,
        pagination: {
          currentPage: page,
          limit,
          totalExpenses: totalCount,
          totalPages,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
