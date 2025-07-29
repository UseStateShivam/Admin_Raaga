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
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <ul className="flex space-x-4">
        <li><a href="/">Home</a></li>
        <li><a href="/event">Events</a></li>
        <li><a href="/about">Buy Tickets</a></li>
        <li>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
        </li>
      </ul>

      {user ? (
        <div className="text-sm text-gray-700">
          Logged in as: <strong>{user.email?.split('@')[0]}</strong>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Not logged in</div>
      )}
    </nav>
  )
}

export default Nav
