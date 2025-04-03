'use client';

import { useState } from 'react';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

const AUTH_TYPE = "authentication"
const REGISTRATION_TYPE = "registration"
const UKN_ERROR = "An unknown error occurred"

export default function AuthForm() {
  const [username, setUsername] = useState('');
  const [action, setAction] = useState('');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister() {
    setSuccess("");
    setAction(REGISTRATION_TYPE);

    try {
      const response = await fetch('/api/auth/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, type: REGISTRATION_TYPE }), // 👈 Pass type
      });
    
      const options = await response.json();
      if (!options) throw new Error('No registration options received.');
      
      const attestationResponse = await startRegistration(options);
      const registerResponse = await fetch('/api/auth/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ attestationResponse, username }) 
      });
      const data = await registerResponse.json();
      if (!data.success) throw new Error("Registration failed.");

      setSuccess(REGISTRATION_TYPE);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : UKN_ERROR);
      setSuccess("");
    }
    finally {
      setAction("");
    }
  }
  
  async function handleLogin() {
    setSuccess("");
    setAction(AUTH_TYPE);

    try {
      const response = await fetch('/api/auth/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, type: AUTH_TYPE }), // 👈 Pass type
      });
    
      const options = await response.json();
      if (!options) throw new Error('No authentication options received.');
    
      const assertionResponse = await startAuthentication(options);
      const loginResponse = await fetch('/api/auth/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ assertionResponse, username }) 
      });
      const data = await loginResponse.json();
      if (!data.success) throw new Error("Login failed.");
      
      setSuccess(AUTH_TYPE);
      setError("");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred");
      }
      setSuccess("");
    }
    finally {
      setAction("");
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 max-w-md mx-auto border rounded-xl shadow-lg bg-white">
      <h2 className="text-xl font-bold">WebAuthn Authentication</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success === REGISTRATION_TYPE && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative w-full text-center">
          🎉 Registration successful! You can now sign in.
        </div>
      )}
      {success === AUTH_TYPE && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative w-full text-center">
          🎉 Authentication successful! You are in.
        </div>
      )}
      <input
        type="text"
        placeholder="Enter your username"
        disabled={!!action}
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleRegister}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        disabled={!!action}
      >
        {action === REGISTRATION_TYPE ? 'Registering...' : 'Register with WebAuthn'}
      </button>

      <button
          onClick={handleLogin}
          disabled={!!action}
          className="w-1/2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
        >
          {action === AUTH_TYPE ? 'Logging in...' : 'Login'}
        </button>
    </div>
  );
}