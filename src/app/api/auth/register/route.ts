import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/customer';
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // First, attempt to register the customer
    const { customer, errors: registerErrors } = await customerService.register(
      {
        email,
        password,
        firstName,
        lastName,
      },
    );
    if (registerErrors && registerErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: registerErrors },
        { status: 400 },
      );
    }

    if (customer) {
      // If registration is successful, attempt to log in the new customer
      const { accessToken, errors: loginErrors } = await customerService.login({
        email,
        password,
      });
      if (loginErrors && loginErrors.length > 0) {
        // Registration was successful, but auto-login failed
        return NextResponse.json(
          {
            success: false,
            errors: loginErrors,
            message: 'Registration successful, but auto-login failed.',
          },
          { status: 400 },
        );
      }

      if (accessToken) {
        const cookie = serialize('customer_token', accessToken.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: accessToken.expiresAt
            ? Math.floor(
                (new Date(accessToken.expiresAt).getTime() - Date.now()) / 1000,
              )
            : 60 * 60 * 24 * 7, // 7 days if expiresAt is not provided
          sameSite: 'lax',
        });

        return NextResponse.json(
          { success: true, message: 'Registration and login successful.' },
          { headers: { 'Set-Cookie': cookie } },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        errors: [{ message: 'An unknown error occurred during registration.' }],
      },
      { status: 500 },
    );
  } catch (error: unknown) {
    console.error('API Register Error:', error);
    return NextResponse.json(
      {
        success: false,
        errors: [
          {
            message:
              error instanceof Error ? error.message : 'Internal server error',
          },
        ],
      },
      { status: 500 },
    );
  }
}
