'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const { options } = await fetch('/api/auth/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test-user' }),
      }).then(res => res.json());

      const attestationResponse = await startRegistration(options);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attestationResponse),
      });

      if (!response.ok) throw new Error('Registration failed');
      alert('Registered successfully');
    } catch (err) {
      setError((err as Error).message);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 max-w-md mx-auto border rounded-xl shadow-lg bg-white">
      <h2 className="text-xl font-bold">WebAuthn Authentication</h2>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleRegister}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        disabled={loading}
      >
        Register with Passkey
      </button>
    </div>
  );
}