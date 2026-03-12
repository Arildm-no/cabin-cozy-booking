import { supabase } from '@/integrations/supabase/client';

export const adminApi = async (action: string, params: Record<string, any> = {}) => {
  const username = localStorage.getItem('blefjell-username');
  const password = localStorage.getItem('blefjell-password');
  
  if (!username || !password) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.functions.invoke('admin', {
    body: { action, username, password, ...params }
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  
  return data;
};
