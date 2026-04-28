require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugPayroll() {
    console.log('--- Debugging Payroll History ---');
    const month = '2026-03';
    
    // Test 1: Simple select
    const { data: d1, error: e1 } = await supabase.from('salary_payments').select('*').limit(1);
    if (e1) console.error('Test 1 Failed:', e1.message);
    else console.log('Test 1 Success: Table accessible');

    // Test 2: Month query
    const { data: d2, error: e2 } = await supabase.from('salary_payments').select('*').eq('month_year', month);
    if (e2) console.error('Test 2 Failed:', e2.message);
    else console.log('Test 2 Success: Query by month works');

    // Test 3: Join query (The likely culprit)
    const { data: d3, error: e3 } = await supabase.from('salary_payments').select('*, staff(name)').eq('month_year', month);
    if (e3) {
        console.error('Test 3 Failed (JOIN ERROR):', e3.message);
        console.log('TIP: If join fails, it usually means the foreign key relationship is not detected or there are multiple paths.');
    }
    else console.log('Test 3 Success: Join works');
}

debugPayroll();
