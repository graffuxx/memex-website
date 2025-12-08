// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnwvwwukqlbwzqroaqeu.supabase.co';
const supabaseKey = 'sb_publishable_Nz664DzwUuBcOpLzCXgB_Q_4SzenMlV';

export const supabase = createClient(supabaseUrl, supabaseKey);