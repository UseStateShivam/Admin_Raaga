'use client'

import supabase from '@/lib/utils/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/login'

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return setError(error.message)

    router.push(redirect.startsWith('/') ? redirect : '/login')
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <input
        className="w-full border p-2 mb-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleSignUp}
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
      >
        Sign Up
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
