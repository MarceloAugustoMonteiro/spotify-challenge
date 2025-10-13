import React from 'react'
import Image from 'next/image'
import spotifyLogo from './assets/spotify-logo.png'

export default function Logo() {
  return (
    <Image 
      src={spotifyLogo} 
      alt="Spotify Logo" 
      width={131} 
      height={40}
      priority
    />
  )
}

