import { signIn } from 'next-auth/react'

export function SocialLinks({ fan }) {
  return (
    <div>
      <button onClick={() => signIn('twitch', { callbackUrl: '/connect-social'})}>
        Conectar Twitch
      </button>
      {fan.socialMedia.twitch.connected && <span>Conectado como @{fan.socialMedia.twitch.username}</span>}
    </div>
  )
}