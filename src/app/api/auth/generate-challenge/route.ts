import { NextResponse } from 'next/server'

import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
} from '@simplewebauthn/server'

import { getCredentialFromDB, saveChallengeToDB } from '@/lib/db'

/**
 * Convert a string into a Uint8Array.
 */
function encodeUserID(userID: string): Uint8Array {
  return new TextEncoder().encode(userID)
}

export async function POST(req: Request) {
  const { username, type } = await req.json()

  let options

  if (type === 'registration') {
    options = await generateRegistrationOptions({
      rpID: process.env.NEXT_PUBLIC_HOSTNAME!,
      rpName: 'My WebAuthn App',
      userID: encodeUserID(username),
      userName: username,
      attestationType: 'none',
    })
  } else {
    const storedCredential = await getCredentialFromDB(username)
    if (!storedCredential) {
      return NextResponse.json(
        { error: 'No credentials found. Please register first.' },
        { status: 400 }
      )
    }

    options = await generateAuthenticationOptions({
      rpID: process.env.NEXT_PUBLIC_HOSTNAME!,
      allowCredentials: [
        {
          id: storedCredential.credential.id,
        },
      ],
    })
  }

  await saveChallengeToDB(username, options.challenge)
  return NextResponse.json(options)
}
