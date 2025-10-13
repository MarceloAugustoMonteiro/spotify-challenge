interface PlaylistsIconProps {
  color?: string
}

export const PlaylistsIcon = ({ color = '#949EA2' }: PlaylistsIconProps) => (
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3.21887L19 12.2189L5 21.2189V3.21887Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

