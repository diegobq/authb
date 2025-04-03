import {
  verifyAuthenticationResponse,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { getCredentialFromDB, getChallengeFromDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { fromBase64URL } from "@/lib/base64URL";

export async function POST(req: Request) {
  const { assertionResponse, username } = await req.json();

  if (!assertionResponse) {
    return NextResponse.json(
      { error: "Missing assertion response" },
      { status: 400 }
    );
  }

  const storedCredential = await getCredentialFromDB(username);
  if (!storedCredential) {
    return NextResponse.json(
      { error: "Credential not found. Please register first." },
      { status: 400 }
    );
  }

  const expectedChallenge = await getChallengeFromDB(username);
  if (!expectedChallenge) {
    return NextResponse.json({ error: "No challenge found" }, { status: 400 });
  }

  const { credential, origin, rpID, userVerified } = storedCredential;
  const { id, publicKey, counter, transports } = credential;

  const requestCredential: WebAuthnCredential = {
    id: id,
    publicKey: fromBase64URL(publicKey), // Convert from Base64 to Uint8Array
    counter,
    transports,
  };

  try {
    const verification = await verifyAuthenticationResponse({
      response: assertionResponse, // The response from the frontend
      expectedChallenge, // The challenge you stored during login initiation
      expectedRPID: rpID,
      expectedOrigin: origin,
      credential: requestCredential,
      requireUserVerification: userVerified, // Optional, depending on your use case
    });

    if (!verification.verified) {
      throw new Error("Authentication failed");
    }
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
