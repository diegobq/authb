import { firestore } from "./firebaseAdmin";

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
export async function saveCredentialToDB(userID: string, credential: unknown) {
  // Recursively remove undefined values from the object
  function removeUndefined(obj: unknown): object {
    return JSON.parse(
      JSON.stringify(obj, (key, value) => (value === undefined ? null : value))
    );
  }

  const sanitizedCredential = removeUndefined(credential);

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
): Promise<unknown | null> {
  const doc = await firestore.collection("credentials").doc(userID).get();
  return doc.exists ? doc.data() : null;
}
