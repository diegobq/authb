import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";

export async function POST(req: Request) {
  const { username } = await req.json();

  const encoder = new TextEncoder();
  const options = await generateRegistrationOptions({
    rpName: "Your App",
    rpID: process.env.NEXT_PUBLIC_HOSTNAME!,
    userID: encoder.encode(username),
    userName: username,
    attestationType: "none",
    authenticatorSelection: { residentKey: "required" },
  });

  return NextResponse.json({ options });
}
