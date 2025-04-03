import { VerifiedRegistrationResponse, WebAuthnCredential } from "@simplewebauthn/server";

export type RegistrationInfoType = VerifiedRegistrationResponse["registrationInfo"];

type CredentialDB = Omit<WebAuthnCredential, "publicKey"> & {
    publicKey: string;
};
export interface IRegistrationInfoDB
  extends Omit<VerifiedRegistrationResponse["registrationInfo"], "credential"> {
  credential: CredentialDB;
}


