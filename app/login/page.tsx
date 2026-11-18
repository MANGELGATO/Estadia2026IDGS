import { env } from '../../lib/env';
import { getDemoUsers } from '../../lib/auth';
import LoginForm from './LoginForm';

// Las cuentas de demostración dependen del entorno en ejecución: no pre-renderizar.
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  // Solo se envían credenciales al navegador si el modo demo está habilitado explícitamente.
  const demoAccounts = env.demoLoginEnabled
    ? getDemoUsers().map((u) => ({ role: u.role, email: u.email, password: u.password }))
    : [];

  return <LoginForm demoAccounts={demoAccounts} />;
}
