import type { BurnoutLog } from '@/lib/definitions';
import { supabase } from './supabase';

export async function addBurnoutLog(log: Omit<BurnoutLog, 'id' | 'logged_at'>): Promise<BurnoutLog> {
  // The app is trying to insert q6 and q7, but they may not exist in the DB.
  // As a temporary workaround, we will remove them from the insert object.
  // The real, permanent fix is for the user to run the SQL migration to add these columns.
  const logToInsert: Partial<BurnoutLog> = { ...log };
  delete logToInsert.q6;
  delete logToInsert.q7;

  const { data, error } = await supabase
    .from('burnout_logs')
    .insert(logToInsert)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to add burnout log.');
  }

  // Supabase returns `logged_at` as a string, so we convert it to a Date object
  // to match our type definition. The returned data won't have q6/q7 yet.
  return {
    ...log, // Return the original log data to match the expected type
    ...data, // But with the id and logged_at from the database
    logged_at: new Date(data.logged_at),
  };
}

export async function getBurnoutLogById(id: string): Promise<BurnoutLog | undefined> {
  const { data, error } = await supabase
    .from('burnout_logs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch burnout log by ID.');
  }
  
  if (!data) {
    return undefined;
  }

  return {
    ...data,
    logged_at: new Date(data.logged_at),
  };
}

export async function getBurnoutLogsBySessionId(sessionId: string): Promise<BurnoutLog[]> {
  const { data, error } = await supabase
    .from('burnout_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('logged_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch burnout logs by session ID.');
  }

  return (data || []).map(log => ({
    ...log,
    logged_at: new Date(log.logged_at)
  }));
}
