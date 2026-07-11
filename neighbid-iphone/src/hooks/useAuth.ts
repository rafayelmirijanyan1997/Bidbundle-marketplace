import {useState, useEffect, useCallback} from 'react';
import {getAuth, getIdToken, onIdTokenChanged} from '@react-native-firebase/auth';
import {fetchMe, logout as apiLogout, User} from '../api/auth';
import {setToken, clearToken} from '../api/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(getAuth(), async fbUser => {
      if (fbUser) {
        try {
          const token = await getIdToken(fbUser);
          await setToken(token);
          setUser(await fetchMe(token));
        } catch {
          // Token is still valid — this just means the backend profile
          // doesn't exist yet (e.g. mid-registration, before /auth/sync
          // has run) or a transient fetch failure. Don't clear the token;
          // register()/login() own that lifecycle.
          setUser(null);
        }
      } else {
        await clearToken();
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return {user, setUser, loading, logout};
}
