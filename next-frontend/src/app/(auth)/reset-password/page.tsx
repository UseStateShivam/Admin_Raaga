'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/utils/supabaseClient'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  // Optional: log session for debug
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Session is missing or expired. Please restart the reset process.')
      }
    })
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Set a New Password</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success ? (
          <p className="text-green-600">
            ✅ Password updated! Redirecting to login...
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Enter your new password"
              className="w-full border rounded p-2 mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !newPassword}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
