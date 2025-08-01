// app/(auth)/login/page.tsx - Simplified approach
'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import supabase from '@/lib/utils/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin/dashboarh'

  const login = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        console.error('❌ Login error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user && data.session) {
        console.log('✅ Login successful - Session created')

        const userId = data.user.id
        const redirectPath = redirect === '/admin/dashboard'
          ? `/admin/dashboard`
          : redirect

        // Ensure session is saved
        let sessionReady = false
        let attempts = 0
        const maxAttempts = 20

        while (!sessionReady && attempts < maxAttempts) {
          attempts++
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            if (currentSession && currentSession.access_token) {
              console.log('✅ Session confirmed ready after', attempts * 100, 'ms')
              sessionReady = true
              break
            }
          } catch (err) {
            console.log('Session check attempt', attempts, 'failed')
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (sessionReady) {
          console.log('🚀 Redirecting to:', redirectPath)
          window.location.replace(redirectPath)
        } else {
          console.log('⚠️ Session not ready, using fallback redirect')
          setTimeout(() => {
            window.location.replace(redirectPath)
          }, 2000)
        }
      }
    } catch (err) {
      console.error('💥 Unexpected login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      login()
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <input
        className="w-full p-2 border mb-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
      <input
        className="w-full p-2 border mb-4 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
      <button
        onClick={login}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  )
}