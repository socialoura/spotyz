import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSettings } from '@/lib/db';

// Helper function to get Stripe instance
async function getStripeInstance(): Promise<Stripe> {
  // Try to get keys from database first
  const dbSettings = await getStripeSettings();
  
  // Use database keys if available, otherwise fall back to env variables
  const secretKey = dbSettings.secretKey || process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('Stripe secret key not configured');
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  });
}

// Type definition for the request body
interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: CreatePaymentIntentRequest = await request.json();
    
    // Validate required fields
    if (!body.amount || !body.currency) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: amount and currency are required',
          details: {
            amount: !body.amount ? 'Amount is required' : undefined,
            currency: !body.currency ? 'Currency is required' : undefined,
          }
        },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate currency format (3-letter ISO code)
    if (typeof body.currency !== 'string' || !/^[a-z]{3}$/i.test(body.currency)) {
      return NextResponse.json(
        { error: 'Currency must be a valid 3-letter ISO currency code (e.g., usd, eur)' },
        { status: 400 }
      );
    }

    // Get Stripe instance (checks database first, then env variables)
    let stripe: Stripe;
    try {
      stripe = await getStripeInstance();
    } catch (error) {
      console.error('Stripe configuration error:', error);
      return NextResponse.json(
        { error: 'Payment service is not properly configured' },
        { status: 500 }
      );
    }

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount,
      currency: body.currency.toLowerCase(),
      // Use only payment_method_types to specify card (which includes Apple Pay and Google Pay)
      payment_method_types: ['card'],
      // Add metadata for tracking (optional)
      metadata: {
        integration_source: 'spotyz',
      },
    });

    // Return the client secret
    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      { status: 200 }
    );

  } catch (error) {
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error:', error.message);
      
      // Map common Stripe errors to appropriate HTTP status codes
      const statusCode = error.statusCode || 500;
      
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
          code: error.code,
        },
        { status: statusCode }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error creating payment intent:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the payment intent' },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests.' },
    { status: 405 }
  );
}
