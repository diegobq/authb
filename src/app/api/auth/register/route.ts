import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(req: Request) {
  try {
    initFirebaseAdmin();
    const { uid, challenge, attestationResponse } = await req.json();
    const auth = getAuth();

    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: challenge,
      expectedRPID: process.env.NEXT_PUBLIC_HOSTNAME!,
      expectedOrigin: process.env.NEXT_PUBLIC_ORIGIN!,
    });

    if (!verification.verified) throw new Error('Invalid registration');

    await auth.createUser({ uid });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}