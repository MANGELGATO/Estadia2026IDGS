import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from './env';
import { getUsuarioByEmailForAuth, updateUsuarioLastLogin } from './db';
import { verifyPassword } from './password';
import { logger } from './logger';
import type { UserRole } from '../types/next-auth';

/**
 * Configuración definitiva de NextAuth.js v4 (Estándar Tecnológico PLAi v1.0, Sección 7).
 * - Sesiones JWT firmadas en servidor (8 horas).
 * - Validación de credenciales contra la tabla `usuarios` de PostgreSQL/Neon con hash scrypt.
 * - Los roles ('admin', 'colaborador', 'usuario') se obtienen exclusivamente del registro autenticado.
 * - Listo para incorporar un proveedor OIDC/OAuth institucional de PLAi en `providers`.
 */
export const authOptions: NextAuthOptions = {
  secret: env.nextAuthSecret,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas de jornada laboral estándar
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
        const user = await getUsuarioByEmailForAuth(normalizedEmail);

        if (!user) {
          return null;
        }

        if (user.status !== 'Activo') {
          logger.warn('Intento de acceso con cuenta inactiva o suspendida', {
            userId: user.id,
          });
          return null;
        }

        const isValid = verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        await updateUsuarioLastLogin(user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
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
        session.user.role = (token.role as UserRole) || 'usuario';
      }
      return session;
    },
  },
};
