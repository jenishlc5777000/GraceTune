import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Role } from '@gracetunes/shared';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

interface SessionState {
  token: string | null;
  user: AdminUser | null;
  signIn: (token: string, user: AdminUser) => void;
  signOut: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: (token, user) => set({ token, user }),
      signOut: () => set({ token: null, user: null }),
    }),
    {
      name: 'gracetunes-admin-session',
      // Session storage: closing the tab signs the admin out.
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
