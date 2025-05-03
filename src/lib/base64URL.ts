export function toBase64URL(buffer?: Uint8Array): string {
  if (!buffer) return ''

  return Buffer.from(buffer).toString('base64url') // Native Node.js support
}

export function fromBase64URL(base64url: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64url, 'base64'))
}
