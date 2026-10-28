import { Loader2, LockKeyhole } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '@gracetunes/shared';
import { api, ApiError } from '../lib/api';
import { useSession, type AdminUser } from '../store/session';

export function Login() {
  const navigate = useNavigate();
  const { user, signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api<{ accessToken: string; user: AdminUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.user.role !== 'ADMIN' && res.user.role !== 'MODERATOR') {
        setError('This account does not have admin access.');
        return;
      }
      signIn(res.accessToken, res.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5';

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <img src="/favicon.svg" alt="" className="h-11 w-11 rounded-xl" />
        <h1 className="mt-5 text-xl font-bold">{APP_CONFIG.name} Admin</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in with an admin or moderator account.</p>

        <label className="mt-6 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${input} mt-1.5`} />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} mt-1.5`} />

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}
          Sign in
        </button>
      </form>
    </div>
  );
}
