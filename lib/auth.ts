import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from './env';

// Usuarios autorizados de demostración y desarrollo alineados con los roles de PLAi
export const DEMO_USERS = [
  {
    id: 'usr-admin-01',
    name: 'Administrador de Laboratorio',
    email: 'admin@plai.mx',
    password: 'AdminPlai2026!',
    role: 'admin' as const,
  },
  {
    id: 'usr-standard-01',
    name: 'Investigador / Alumno PLAi',
    email: 'usuario@plai.mx',
    password: 'UserPlai2026!',
    role: 'usuario' as const,
  },
];

export const authOptions: NextAuthOptions = {
  secret: env.nextAuthSecret || process.env.NEXTAUTH_SECRET || 'plai-dev-secret-key-32chars-min-2026',
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas de sesión laboral estándar
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credenciales Institucionales PLAi',
      credentials: {
        email: { label: 'Correo Institucional', type: 'email', placeholder: 'correo@plai.mx' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const found = DEMO_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!found) {
          return null;
        }

        // Valida contra contraseña oficial o atajo 'admin123' / 'user123'
        const isValid =
          credentials.password === found.password ||
          (found.role === 'admin' && credentials.password === 'admin123') ||
          (found.role === 'usuario' && credentials.password === 'user123');

        if (!isValid) {
          return null;
        }

        return {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as 'admin' | 'usuario') || 'usuario';
      }
      return session;
    },
  },
};
