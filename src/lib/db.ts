import { fromBase64URL, toBase64URL } from "@/lib/base64URL";
import { firestore } from "@/lib/firebaseAdmin";
import { IRegistrationInfoDB, RegistrationInfoType } from "@/lib/type";

function removeUndefined(obj: unknown): object {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => (value === undefined ? null : value))
  );
}

/**
 * Save the challenge for a user
 */
export async function saveChallengeToDB(userID: string, challenge: string) {
  await firestore
    .collection("challenges")
    .doc(userID)
    .set({ challenge, createdAt: Date.now() });
}

/**
 * Get the challenge for a user
 */
export async function getChallengeFromDB(
  userID: string
): Promise<string | null> {
  const doc = await firestore.collection("challenges").doc(userID).get();
  return doc.exists ? (doc.data()?.challenge as string) : null;
}

/**
 * Save the credential for a user
 */
export async function saveCredentialToDB(
  userID: string,
  registrationInfo?: RegistrationInfoType
) {
  const registrationInfoDB: IRegistrationInfoDB = {
    ...registrationInfo,
    credential: {
      id: registrationInfo?.credential.id || "",
      counter: registrationInfo?.credential.counter || 0,
      transports: registrationInfo?.credential.transports,
      ...registrationInfo?.credential,
      publicKey: toBase64URL(registrationInfo?.credential?.publicKey),
    },
  };

  const sanitizedCredential = removeUndefined(registrationInfoDB);

  await firestore
    .collection("credentials")
    .doc(userID)
    .set(sanitizedCredential);
}

/**
 * Get the credential for a user
 */
export async function getCredentialFromDB(
  userID: string
): Promise<RegistrationInfoType | null> {
  const doc = await firestore.collection("credentials").doc(userID).get();

  if (!doc.exists) return null;

  const storedRegistrationInfo = doc.data() as IRegistrationInfoDB;

  if (!storedRegistrationInfo || !storedRegistrationInfo.credential.publicKey)
    return null;

  const registrationInfo = {
    ...storedRegistrationInfo,
    credential: {
      id: storedRegistrationInfo.credential.id,
      counter: storedRegistrationInfo.credential.counter,
      transports: storedRegistrationInfo.credential.transports,
      publicKey: fromBase64URL(storedRegistrationInfo?.credential.publicKey),
    },
  };

  return registrationInfo as RegistrationInfoType;
}
