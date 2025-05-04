import NextAuth              from 'next-auth'
import CredentialsProvider   from 'next-auth/providers/credentials'
import TwitchProvider        from 'next-auth/providers/twitch'
import TwitterProvider       from 'next-auth/providers/twitter'
import GoogleProvider        from 'next-auth/providers/google'

import { MongoDBAdapter }    from '@next-auth/mongodb-adapter'
import clientPromise         from '../../../lib/mongodb'
import dbConnect             from '../../../lib/db'

import User                  from '../../../models/User'
import bcrypt                from 'bcryptjs'

export const authOptions = {
  /* ────────── sessão / adapter ────────── */
  adapter : MongoDBAdapter(clientPromise),
  secret  : process.env.NEXTAUTH_SECRET,
  session : { strategy: 'jwt' },

  /* ───────────── providers ───────────── */
  providers: [
    /* ----- login local (e-mail + senha) ----- */
    CredentialsProvider({
      name: 'Email + Senha',
      credentials: {
        email   : { label:'Email',  type:'email'    },
        password: { label:'Senha',  type:'password' }
      },
      async authorize({ email, password }) {
        await dbConnect()
        const user = await User.findOne({ email: email.toLowerCase() })
                               .select('+password')
        if (!user)             throw new Error('Usuário não encontrado')
        const ok = await bcrypt.compare(password, user.password)
        if (!ok)               throw new Error('Senha inválida')
        return { id:user._id.toString(), name:user.name, email:user.email }
      }
    }),

    /* ---------- Twitch (OIDC) ---------- */
    TwitchProvider({
      clientId    : process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      authorization: {
        params: {
          scope : 'openid user:read:email user:read:follows',
          claims: { id_token:{ email:null, preferred_username:null, picture:null } }
        }
      },
      idToken: true
    }),

    /* ---------- Twitter (OAuth 2.0) ---------- */
    TwitterProvider({
      clientId    : process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version     : '2.0',
      authorization: {
        params: {
          scope        : 'tweet.read users.read like.read follows.read offline.access',
          'user.fields': 'id,name,username,profile_image_url'
        }
      }
    }),

    /* ---------- Google / YouTube ---------- */
    GoogleProvider({
      clientId    : process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/youtube.readonly',
          
          access_type: 'offline',

          prompt: 'consent'

        }
      }
    })
  ],

  /* ───────────── callbacks ───────────── */
  callbacks: {
    async jwt({ token, user, account, profile }) {
      /* adiciona dados extras do Twitch ao token */
      if (account?.provider === 'twitch') {
        token.twitch = {
          accessToken: account.access_token,
          id        : account.providerAccountId,
          username  : profile.preferred_username
        }
      }

      /* garante que id do usuário esteja no JWT */
      if (user && !token.id) token.id = user.id
      return token
    },

    async session({ session, token }) {
      if (token.id)     session.user.id = token.id
      if (token.twitch) session.twitch  = token.twitch
      return session
    },

    /* roda apenas na 1ª vez que aquele provider é usado */
    async signIn({ user, account, profile }) {
      if (account.provider !== 'twitter') return true

      /* profile v2 → root / profile v1 → root (sem data) */
      const src       = profile.data ?? profile
      const username  = src.username
                     ?? src.screen_name
                     ?? null
      const avatar    = src.profile_image_url
                     ?? src.profile_image_url_https
                     ?? src.image
                     ?? null

      /* grava no banco apenas se user.id for ObjectId (usuário já criado) */
      if (/^[0-9a-fA-F]{24}$/.test(user.id ?? '')) {
        await dbConnect()
        await User.findByIdAndUpdate(
          user.id,
          {
            $set: {
              'socialMedia.twitter': {
                connected   : true,
                id          : src.id,
                username,
                name        : src.name,
                avatar,
                accessToken : account.access_token,
                refreshToken: account.refresh_token,
                userData    : profile,
                lastSync    : new Date()
              }
            }
          }
        )
      }
      return true
    }
  },

  /* ───────────── eventos ───────────── */
  events: {
    async linkAccount({ user, account, profile }) {
      await dbConnect()
      const dbUser = await User.findById(user.id)
      if (!dbUser) return

      /* ---------- Twitch ---------- */
      if (account.provider === 'twitch') {
        const username =
              profile.preferred_username ??
              profile.login             ??
              profile.name              ?? null
        const avatar =
              profile.picture           ??
              profile.profile_image_url ??
              profile.image             ?? null

        dbUser.socialMedia.twitch = {
          connected   : true,
          username,
          avatar,
          accessToken : account.access_token,
          refreshToken: account.refresh_token,
          userData    : profile,
          lastSync    : new Date()
        }
      }

      /* ---------- Twitter ---------- */
      if (account.provider === 'twitter') {
        const src      = profile.data ?? profile
        const username = src.username ?? src.screen_name ?? null
        const avatar   =
              src.profile_image_url ??
              src.profile_image_url_https ??
              src.image ?? null

        dbUser.socialMedia.twitter = {
          connected   : true,
          id          : src.id,
          username,
          name        : src.name,
          avatar,
          accessToken : account.access_token,
          refreshToken: account.refresh_token,
          userData    : profile,
          lastSync    : new Date()
        }
      }

      /* ---------- Google / YouTube ---------- */
      if (account.provider === 'google') {
        const avatar =
              profile.picture ??
              profile.image   ??
              profile.avatar  ?? null

        dbUser.socialMedia.youtube = {
          connected   : true,
          id          : profile.sub,
          username    : profile.name,
          name        : profile.name,
          avatar,
          accessToken : account.access_token,
          refreshToken: account.refresh_token,
          userData    : profile,
          lastSync    : new Date()
        }
      }

      await dbUser.save()
    }
  },

  /* páginas customizadas */
  pages: { signIn:'/login', error:'/connect-social' }
}

export default NextAuth(authOptions)