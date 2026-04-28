require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function diagnose() {
    console.log('🔍 Starting Database Diagnosis...');
    
    // 1. Check staff table
    console.log('\n[1/3] Checking "staff" table...');
    const { data: staffData, error: staffError } = await supabase.from('staff').select('*').limit(1);
    
    if (staffError) {
        console.error('❌ Error reading "staff" table:', staffError.message);
        if (staffError.message.includes('column "base_salary"')) {
            console.log('💡 FIX: run "ALTER TABLE staff ADD COLUMN base_salary NUMERIC DEFAULT 15000;"');
        }
    } else {
        console.log('✅ "staff" table is accessible.');
        if (staffData.length > 0 && staffData[0].base_salary === undefined) {
             console.log('❌ Missing "base_salary" column in "staff" table.');
        } else {
             console.log('✅ "base_salary" column exists.');
        }
    }

    // 2. Check staff_leaves table
    console.log('\n[2/3] Checking "staff_leaves" table...');
    const { error: leavesError } = await supabase.from('staff_leaves').select('*').limit(1);
    if (leavesError) {
        console.error('❌ "staff_leaves" table missing or inaccessible:', leavesError.message);
        console.log('💡 FIX: Create the table using the SQL provided in the chat.');
    } else {
        console.log('✅ "staff_leaves" table exists.');
    }

    // 3. Check staff_attendance table
    console.log('\n[3/3] Checking "staff_attendance" table...');
    const { error: attError } = await supabase.from('staff_attendance').select('*').limit(1);
    if (attError) {
        console.error('❌ "staff_attendance" table issue:', attError.message);
    } else {
        console.log('✅ "staff_attendance" table exists.');
    }

    console.log('\n--- Diagnosis Complete ---');
}

diagnose();
