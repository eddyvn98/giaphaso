/**
 * SCRIPT CHỐNG NGỦ (KEEP-ALIVE)
 * Hướng dẫn: Cấu hình GitHub Action chạy file này mỗi tuần
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(url, key);

async function wakeUp() {
    try {
        console.log('📡 Sending ping to Supabase...');
        const { data, error } = await supabase.from('people').select('id').limit(1);

        if (error) {
            console.error('❌ Ping failed:', error.message);
            process.exit(1);
        } else {
            console.log('✅ Ping success! Your database is wide awake.');
            process.exit(0);
        }
    } catch (err) {
        console.error('💥 Unexpected error during ping:', err.message);
        process.exit(1);
    }
}

wakeUp();
