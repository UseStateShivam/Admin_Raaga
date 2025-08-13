'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import supabase from '@/lib/utils/supabaseClient'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)  // NEW: redirect state
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    if (data.user && data.session) {
      const userId = data.user.id

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('admin_id')
        .eq('admin_id', userId)
        .single()

      if (!adminData || adminError) {
        setError('You are not authorized to access the admin dashboard.')
        setLoading(false)
        return
      }

      // Before redirecting, show feedback
      setRedirecting(true)

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        // Small delay optional (for UX)
        setTimeout(() => {
          router.replace(redirect)
        }, 500)
      } else {
        const unsub = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            router.replace(redirect)
            unsub.data.subscription.unsubscribe()
          }
        })
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md">
        {/* Golden border container */}
        <div className="border-2 border-[#E0AF41] rounded-lg p-8 bg-black">
          {/* Logo and branding */}
          <div className="text-center">
            <div className="flex items-center justify-center">
              {/* Flute icon representation */}
              <Image src="/raaga-logo.png" alt="Icon" width={144} height={144} />
            </div>
          </div>

          {/* Login form */}
          <h2 className="text-white text-2xl font-light text-center mb-8">Admin Login</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-white text-sm mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E0AF41] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-white text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  autoComplete="off"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E0AF41] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading || redirecting}
              className="w-full bg-[#E0AF41] text-white font-medium py-3 px-4 rounded-lg hover:from-[#E0AF41] hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-[#E0AF41] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </div>
              ) : redirecting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Redirecting...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
