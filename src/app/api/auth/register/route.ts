import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { saveCredentialToDB, getChallengeFromDB } from "@/lib/db";
import { toBase64URL } from "@/lib/base64URL";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { attestationResponse, username } = await req.json();
  const expectedChallenge = await getChallengeFromDB(username);

  if (!expectedChallenge) {
    return NextResponse.json({ error: "No challenge found" }, { status: 400 });
  }

  const verification = await verifyRegistrationResponse({
    response: attestationResponse,
    expectedChallenge,
    expectedRPID: process.env.NEXT_PUBLIC_HOSTNAME!,
    expectedOrigin: process.env.NEXT_PUBLIC_ORIGIN!,
  });

  const publicKey = verification.registrationInfo?.credential.publicKey;

  if (!verification.verified || !publicKey) {
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }
  const registrationInfo = {
    ...verification.registrationInfo,
    credential: {
      ...verification.registrationInfo?.credential,
      publicKey: toBase64URL(publicKey), // Convert to Base64URL string
    },
  };

  await saveCredentialToDB(username, registrationInfo);
  return NextResponse.json({ success: true });
}
