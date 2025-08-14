'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import '../app/globals.css'


function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      NProgress.start()
      await supabase.auth.signOut()
      router.push('/login')
    } finally {
      setLoggingOut(false)
      NProgress.done()
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) setUser(session.user)
    }
    getUser()
  }, [supabase.auth])

  // Stop NProgress when pathname changes
  useEffect(() => {
    NProgress.done()
  }, [pathname])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    NProgress.start()
    router.push(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 flex flex-col text-gray-100 z-[1000] bg-gradient-to-b from-black to-transparent">
      <div className="flex items-center justify-between px-4 sm:px-8 py-2">
        {/* Logo */}
        <div className="flex items-center gap-4 sm:gap-8">
          <Image src="/raaga-logo.png" alt="Raaga Logo" width={80} height={24} className="w-20 sm:w-24" />

          {/* Desktop Menu */}
          <ul className="hidden sm:flex space-x-4">
            {[
              { label: 'Scan', href: '/admin/scan' },
              { label: 'Dashboard', href: '/admin/dashboard' },
            ].map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={`transition-colors cursor-pointer duration-200 ${pathname === item.href ? 'text-[#E0AF41] underline underline-offset-4' : 'hover:text-[#E0AF41]'
                    }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Section - Desktop */}
        <div className="hidden sm:flex items-stretch gap-4">
          {user ? (
            <>
              <strong className="text-[#E0AF41]">{user.email?.split('@')[0]}</strong>
              <button
                onClick={handleLogout}
                className="cursor-pointer flex items-center justify-center w-6 h-6"
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <svg
                    className="animate-spin h-5 w-5 text-[#E0AF41]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
                    ></path>
                  </svg>
                ) : (
                  <Image src="/exit.svg" alt="Logout" width={24} height={24} className="w-6" />
                )}
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-500">Not logged in</div>
          )}
        </div>

        {/* Hamburger - Mobile */}
        <button
          className="sm:hidden flex flex-col gap-1.5 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="w-6 h-[2px] bg-white"></span>
          <span className="w-6 h-[2px] bg-white"></span>
          <span className="w-6 h-[2px] bg-white"></span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col bg-black bg-opacity-90 p-4 gap-4 border-t border-[#E0AF41] animate-fadeIn">
          {[
            { label: 'Scan', href: '/admin/scan' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className={`text-left ${pathname === item.href ? 'text-[#E0AF41] underline underline-offset-4' : 'hover:text-[#E0AF41]'
                }`}
            >
              {item.label}
            </button>
          ))}

          {user ? (
            <>
              <button
                onClick={() => handleNavClick(`/my-tickets/${user.id}`)}
                className={`text-left ${pathname.startsWith('/my-tickets') ? 'text-[#E0AF41] underline underline-offset-4' : 'hover:text-[#E0AF41]'
                  }`}
              >
                My Tickets
              </button>
              <strong className="text-[#E0AF41]">{user.email?.split('@')[0]}</strong>
              <button
                onClick={() => {
                  handleLogout()
                  setMenuOpen(false)
                }}
                className="flex items-center gap-2 hover:text-[#E0AF41]"
              >
                <Image src="/exit.svg" alt="Logout" width={20} height={20} className="w-5" /> Logout
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-500">Not logged in</div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Nav