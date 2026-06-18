import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL  = 'https://omtyrmscccjibacullie.supabase.co';
const SUPABASE_ANON = 'sb_publishable_s7TEC1mL9RkzynwFrHzbXQ_VhSQohE1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
