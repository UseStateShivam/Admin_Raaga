'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/auth-helpers-nextjs'

function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-black text-white">
      <ul className="flex space-x-4">
        <li><a href="/admin/scan">Scan</a></li>
        <li><a href="/admin/dashboard">Dashboard</a></li>
      </ul>

      {user ? (
        <div className="text-sm">
          <strong>{user.email?.split('@')[0]}</strong>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline ml-2 cursor-pointer"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Not logged in</div>
      )}
    </nav>
  )
}

export default Nav
