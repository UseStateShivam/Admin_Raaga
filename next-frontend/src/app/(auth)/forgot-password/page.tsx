// app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import supabase from '@/lib/utils/supabaseClient'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    })

    if (error) return setError(error.message)
    setMessage('Reset link sent! Check your email.')
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <input
        type="email"
        placeholder="Your email"
        className="w-full border p-2 mb-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleReset} className="bg-blue-600 text-white w-full py-2 rounded">
        Send Reset Link
      </button>
      {message && <p className="text-green-500 mt-2">{message}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
