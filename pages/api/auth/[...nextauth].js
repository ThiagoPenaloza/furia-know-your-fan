import NextAuth            from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import TwitchProvider      from 'next-auth/providers/twitch'
import TwitterProvider     from 'next-auth/providers/twitter'
import GoogleProvider      from 'next-auth/providers/google'   // ← novo
import { MongoDBAdapter }  from '@next-auth/mongodb-adapter'
import clientPromise       from '../../../lib/mongodb'
import dbConnect           from '../../../lib/db'
import User                from '../../../models/User'
import bcrypt              from 'bcryptjs'

export const authOptions = {
  /* ───────────── sessão / adapter ───────────── */
  adapter : MongoDBAdapter(clientPromise),
  secret  : process.env.NEXTAUTH_SECRET,
  session : { strategy: 'jwt' },

  /* ───────────── providers ───────────── */
  providers: [
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
        return { id: user._id.toString(), name:user.name, email:user.email }
      }
    }),

    /* ---------- Twitch (OIDC) ---------- */
    TwitchProvider({
      clientId    : process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      authorization: {
        params: {
          scope : 'openid user:read:email',
          claims: {
            id_token: { email:null, preferred_username:null, picture:null }
          }
        }
      },
      idToken: true
    }),

    /* ----------- 🆕 TWITTER -------------- */
    // Versão OAuth 2.0 (recomendada)
    TwitterProvider({
      clientId    : process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version     : '2.0',                 // usa a API 2
      authorization: {
        params: {
          // escopos mínimos para pegar dados de perfil e e-mail
          scope: 'tweet.read users.read offline.access',
        },
      },
    }),

    /* ---------- 🆕 GOOGLE / YOUTUBE ---- */
    GoogleProvider({
      clientId    : process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/youtube.readonly'
        }
      }
    })
  ],

  /* ───────────── callbacks ───────────── */
  callbacks: {
    async jwt({ token, user, account, profile }) {
      /* login Twitch – guarda access_token e username */
      if (account?.provider === 'twitch') {
        token.twitch = {
          accessToken: account.access_token,
          id        : account.providerAccountId,
          username  : profile.preferred_username
        }
      }

      /* garante id no token */
      if (user && !token.id) token.id = user.id
      return token
    },

    async session({ session, token }) {
      if (token.id)     session.user.id = token.id
      if (token.twitch) session.twitch  = token.twitch
      return session
    },

    async signIn({ user, account, profile }) {
      /* -------------------------------------------------
       * Esse callback roda em dois cenários:
       *  1) Usuário ENTRA pela 1ª vez com Twitter  → user.id é ObjectId (24 chars)
       *  2) Usuário JÁ LOGADO e clica em “Conectar Twitter”
       *     → user.id é o providerAccountId do Twitter (não é ObjectId)
       * Só devemos mexer no banco no 1º caso para evitar
       * “Cast to ObjectId failed”.
       * ------------------------------------------------- */
      if (account.provider === 'twitter') {
        // Atualiza só se o id parece um ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(user.id ?? '')) {
          await dbConnect()

          await User.findByIdAndUpdate(
            user.id,
            {
              $set: {
                'socialMedia.twitter': {
                  connected: true,
                  id       : profile.data?.id,
                  username : profile.data?.username,
                  name     : profile.data?.name,
                  avatar   : profile.data?.profile_image_url,
                  userData : profile,
                  lastSync : new Date()
                },
              },
            },
            { new: true, upsert: false }
          )
        }
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

      /* ───────────── TWITCH ───────────── */
      if (account.provider === 'twitch') {
        const username =
          profile.preferred_username ||
          profile.login               ||
          profile.name                ||
          null

        const avatar =
          profile.picture             ||
          profile.profile_image_url   ||
          profile.image               ||
          null

        dbUser.socialMedia.twitch = {
          username,
          avatar,
          connected   : true,
          accessToken : account.access_token,
          userData    : profile,
          lastSync    : new Date()
        }
      }

      /* ───────────── 🆕 TWITTER ───────────── */
      if (account.provider === 'twitter') {
        // profile pode vir em dois formatos:
        //  • v2 → { data:{ … } }
        //  • v1 → { id, screen_name, image, … }
        const src = profile.data ?? profile

        dbUser.socialMedia.twitter = {
          connected   : true,
          id          : src.id,
          username    : src.username            // v2
                     ?? src.screen_name        // v1
                     ?? null,
          name        : src.name,
          avatar      : src.profile_image_url   // v2
                     ?? src.profile_image_url_https
                     ?? src.image              // v1
                     ?? null,
          accessToken : account.access_token,
          refreshToken: account.refresh_token,
          userData    : profile,
          lastSync    : new Date()
        }
      }

      /* ───────────── 🆕 GOOGLE / YOUTUBE ───────────── */
      if (account.provider === 'google') {
        const avatar =
          profile.picture           ||   // padrão Google
          profile.image             ||   // quando vem como “image”
          profile.avatar            ||   // qualquer outro alias
          null

        dbUser.socialMedia.youtube = {
          connected   : true,
          id          : profile.sub,
          username    : profile.name,
          name        : profile.name,
          avatar,
          userData    : profile,
          accessToken : account.access_token,
          refreshToken: account.refresh_token,
          lastSync    : new Date()
        }
      }

      await dbUser.save()
    }
  },

  pages: { signIn:'/login', error:'/connect-social' }
}

export default NextAuth(authOptions)