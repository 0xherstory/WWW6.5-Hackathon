import { NextRequest, NextResponse } from 'next/server';
import { keccak256, toBytes } from 'viem';
import { getStoredCode, deleteCode } from '@/lib/verificationStore';

function hashEmail(email: string): `0x${string}` {
  return keccak256(toBytes(email.toLowerCase()));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Invalid code format' },
        { status: 400 }
      );
    }

    const stored = getStoredCode(email);

    if (!stored) {
      return NextResponse.json(
        { success: false, error: 'Code expired or not found. Please request a new code.' },
        { status: 400 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    deleteCode(email);

    const emailHash = hashEmail(email);

    console.log(`[DEV] Email verified: ${email} -> ${emailHash}`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      emailHash,
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
