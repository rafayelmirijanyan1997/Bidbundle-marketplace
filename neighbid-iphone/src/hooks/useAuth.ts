import {useState, useEffect, useCallback} from 'react';
import {fetchMe, logout as apiLogout, User} from '../api/auth';
import {setToken, clearToken} from '../api/client';
import {supabase} from '../api/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({data: {session}}) => {
      if (session) {
        await setToken(session.access_token);
        try {
          setUser(await fetchMe());
        } catch {
          await clearToken();
        }
      }
      setLoading(false);
    });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return {user, setUser, loading, logout};
}
