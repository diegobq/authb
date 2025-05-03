'use client'

import { useState } from 'react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

const AUTH_TYPE = 'authentication'
const REGISTRATION_TYPE = 'registration'
const UKN_ERROR = 'An unknown error occurred'

export default function AuthForm() {
  const [username, setUsername] = useState('')
  const [action, setAction] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleRegister() {
    setSuccess('')
    setAction(REGISTRATION_TYPE)

    try {
      const response = await fetch('/api/auth/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, type: REGISTRATION_TYPE }),
      })

      const options = await response.json()
      if (!options) throw new Error('No registration options received.')

      const attestationResponse = await startRegistration(options)
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attestationResponse, username }),
      })

      const data = await registerResponse.json()
      if (!data.success) throw new Error('Registration failed.')

      setSuccess(REGISTRATION_TYPE)
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : UKN_ERROR)
      setSuccess('')
    } finally {
      setAction('')
    }
  }

  async function handleLogin() {
    setSuccess('')
    setAction(AUTH_TYPE)

    try {
      const response = await fetch('/api/auth/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, type: AUTH_TYPE }),
      })

      const options = await response.json()
      if (!options) throw new Error('No authentication options received.')

      const assertionResponse = await startAuthentication(options)
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assertionResponse, username }),
      })

      const data = await loginResponse.json()
      if (!data.success) throw new Error('Login failed.')

      setSuccess(AUTH_TYPE)
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : UKN_ERROR)
      setSuccess('')
    } finally {
      setAction('')
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 p-6 max-w-md mx-auto border rounded-xl shadow-lg bg-white dark:bg-gray-900 dark:text-white transition-colors">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        WebAuthn Authentication
      </h2>

      {/* Status Messages - Hidden when empty */}
      {(error || success) && (
        <div className="w-full">
          {error && (
            <p className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 px-4 py-2 rounded-md text-center">
              ❌ {error}
            </p>
          )}
          {success === REGISTRATION_TYPE && (
            <div className="bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-200 px-4 py-3 rounded-md text-center">
              🎉 Registration successful! You can now sign in.
            </div>
          )}
          {success === AUTH_TYPE && (
            <div className="bg-green-100 dark:bg-green-800 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded-md text-center">
              🎉 Authentication successful! You are in.
            </div>
          )}
        </div>
      )}

      {/* Username Input */}
      <input
        type="text"
        placeholder="Enter your username"
        disabled={!!action}
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
      />

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={!!action || !username}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 transition disabled:bg-gray-400"
      >
        {action === AUTH_TYPE ? 'Logging in...' : 'Login'}
      </button>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition disabled:opacity-50"
        disabled={!!action || !username}
      >
        {action === REGISTRATION_TYPE
          ? 'Registering...'
          : 'Register with WebAuthn'}
      </button>
    </div>
  )
}
