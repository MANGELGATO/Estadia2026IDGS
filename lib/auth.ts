import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { timingSafeEqual } from 'node:crypto';
import { env } from './env';

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'usuario';
};

/**
 * Cuentas de demostración (solo desarrollo / evaluación).
 * - Se habilitan únicamente si `env.demoLoginEnabled` (por defecto: fuera de producción).
 * - Las contraseñas provienen de variables de entorno / Docker secrets, nunca del código.
 * - En producción el proveedor de identidad real lo define PLAi (estándar sec. 7).
 */
export function getDemoUsers(): DemoUser[] {
  if (!env.demoLoginEnabled) return [];

  const adminPassword = env.demoAdminPassword;
  const userPassword = env.demoUserPassword;
  const users: DemoUser[] = [];

  if (adminPassword) {
    users.push({
      id: 'usr-admin-01',
      name: 'Administrador de Laboratorio PLAi',
      email: 'admin@plai.edu.mx',
      password: adminPassword,
      role: 'admin',
    });
  }
  if (userPassword) {
    users.push({
      id: 'usr-standard-01',
      name: 'Investigador / Alumno PLAi',
      email: 'user@plai.edu.mx',
      password: userPassword,
      role: 'usuario',
    });
  }
  return users;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export const authOptions: NextAuthOptions = {
  // Getter: se evalúa por petición (no en tiempo de build) y falla si falta en producción.
  get secret() {
    return env.nextAuthSecret;
  },
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
        const found = getDemoUsers().find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!found || !safeEqual(credentials.password, found.password)) {
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
