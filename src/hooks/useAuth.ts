import { useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkRole = async (user: User | null) => {
      setRoleLoading(true);
      if (!user) {
        setIsAdmin(false);
        setRoleLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single<UserRole>();

      if (error || !data) {
        setIsAdmin(false);
        setRoleLoading(false);
        return;
      }

      setIsAdmin(data.role === 'admin');
      setRoleLoading(false);
    };

    checkRole(session?.user ?? null);
  }, [session]);

  return useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAdmin,
      loading,
      roleLoading,
      signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
      signOut: () => supabase.auth.signOut(),
    }),
    [session, isAdmin, loading, roleLoading],
  );
}

