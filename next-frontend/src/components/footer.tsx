'use client'

import React from 'react'
import Image from 'next/image'

function Footer() {
  return (
    <footer className="text-white mt-24">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 sm:gap-0 px-4 sm:px-6 py-4">
        {/* Links */}
        <ul className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-10 text-xs sm:text-[13px] text-[#E0AF41] text-center">
          <li>
            <a href="https://raagaexperience.com/tnc/" className="hover:underline">Terms &amp; conditions</a>
          </li>
          <li>
            <a href="https://raagaexperience.com/privacy-policy/" className="hover:underline">Privacy policy</a>
          </li>
          <li>
            <a href="https://raagaexperience.com/contact/" className="hover:underline">Contact Us</a>
          </li>
          <li>
            <a href="https://raagaexperience.com/refund-and-cancellation-policy/" className="hover:underline">Refund &amp; Cancellation policy</a>
          </li>
        </ul>

        {/* Socials */}
        <div className="flex justify-center sm:justify-center items-center gap-4 sm:gap-6">
          <a
            href="https://open.spotify.com/playlist/66ZbnDVVXpNENXHmzeEtaR?si=S0fcU9_ISjezHtPAn-chEw&pi=KzE87DSHRK-nm&nd=1&dlsi=5b5fefcb16df40e8"
            aria-label="Spotify"
          >
            <Image
              src="/spotify.png"
              alt="Spotify"
              width={20}
              height={20}
              className="sm:w-5 sm:h-5"
            />
          </a>
          <a href="https://www.instagram.com/raagaexperience/" aria-label="Instagram">
            <Image
              src="/ig.png"
              alt="Instagram"
              width={20}
              height={20}
              className="sm:w-5 sm:h-5"
            />
          </a>
          <a href="https://www.youtube.com/channel/UC9Vgm7fwG_mDUEo5ZRVIE9Q" aria-label="Youtube">
            <Image
              src="/yt.png"
              alt="Youtube"
              width={24}
              height={24}
              className="sm:w-6 sm:h-6"
            />
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#E0AF41] text-black text-center text-xs sm:text-sm py-2 px-4">
        Copyright © 2025 Energized Lighting Solutions Private Limited. |
        Designed &amp; Developed by{' '}
        <a href="https://techhaxer.com/" className="text-[#102E50] hover:underline">
          TechHaxer
        </a>
      </div>
    </footer>
  )
}

export default Footer
