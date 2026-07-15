import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (password: string) => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (data && data.value === password) {
      setIsAdmin(true);
      setError('');
      return true;
    }
    setError('密码不对哦~');
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
  }, []);

  return { isAdmin, error, login, logout };
}
