import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Initialize Supabase client
export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY, // Use service key for server-side operations
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
    try {
        const { error } = await supabase.from('categories').select('id').limit(1);

        if (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }

        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error);
        return false;
    }
};

export default supabase;
