import { NextResponse } from 'next/server'

import { verifyRegistrationResponse } from '@simplewebauthn/server'

import { saveCredentialToDB, getChallengeFromDB } from '@/lib/db'

export async function POST(req: Request) {
  const { attestationResponse, username } = await req.json()
  const expectedChallenge = await getChallengeFromDB(username)

  if (!expectedChallenge) {
    return NextResponse.json({ error: 'No challenge found' }, { status: 400 })
  }

  const verification = await verifyRegistrationResponse({
    response: attestationResponse,
    expectedChallenge,
    expectedRPID: process.env.NEXT_PUBLIC_HOSTNAME!,
    expectedOrigin: process.env.NEXT_PUBLIC_ORIGIN!,
  })

  if (!verification.verified) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  }

  await saveCredentialToDB(username, verification.registrationInfo)
  return NextResponse.json({ success: true })
}
