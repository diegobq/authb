import { NextResponse } from 'next/server'

import { verifyAuthenticationResponse } from '@simplewebauthn/server'

import { getCredentialFromDB, getChallengeFromDB } from '@/lib/db'

export async function POST(req: Request) {
  const { assertionResponse, username } = await req.json()

  if (!assertionResponse) {
    return NextResponse.json(
      { error: 'Missing assertion response' },
      { status: 400 }
    )
  }

  const storedCredential = await getCredentialFromDB(username)
  if (!storedCredential) {
    return NextResponse.json(
      { error: 'Credential not found. Please register first.' },
      { status: 400 }
    )
  }

  const expectedChallenge = await getChallengeFromDB(username)
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'No challenge found' }, { status: 400 })
  }

  const { credential, origin, userVerified } = storedCredential

  try {
    const verification = await verifyAuthenticationResponse({
      response: assertionResponse, // The response from the frontend
      expectedChallenge, // The challenge you stored during login initiation
      expectedRPID: process.env.NEXT_PUBLIC_HOSTNAME!,
      expectedOrigin: origin,
      credential,
      requireUserVerification: userVerified, // Optional, depending on your use case
    })

    if (!verification.verified) {
      throw new Error('Authentication failed')
    }
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
