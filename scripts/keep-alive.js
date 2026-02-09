/**
 * SCRIPT CHỐNG NGỦ (KEEP-ALIVE)
 * Hướng dẫn: Cấu hình GitHub Action chạy file này mỗi 3 ngày 
 * hoặc đơn giản là thỉnh thoảng mở App lên.
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function wakeUp() {
    console.log('Sending ping to Supabase...');
    const { data, error } = await supabase.from('people').select('id').limit(1);
    if (error) console.error('Ping failed:', error);
    else console.log('Ping success! Your database is wide awake.');
}

wakeUp();
