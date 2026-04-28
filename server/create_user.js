const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function createTestUsers() {
  console.log('Refreshing test users...');
  
  // Clear existing
  await supabase.from('staff').delete().in('staff_id', ['STF001', 'HR001']);

  const { error: err1 } = await supabase
    .from('staff')
    .insert([{
      staff_id: 'STF001',
      name: 'Test Employee',
      mobile: '1234567890',
      role: 'Staff',
      password: 'password',
      is_password_set: true
    }]);

  const { error: err2 } = await supabase
    .from('staff')
    .insert([{
      staff_id: 'HR001',
      name: 'HR Manager',
      mobile: '0987654321',
      role: 'hr',
      password: 'password',
      is_password_set: true
    }]);

  if (err1 || err2) {
    console.error('Error creating users:', err1?.message || err2?.message);
  } else {
    console.log('Successfully created:');
    console.log('1. Staff: STF001 / password');
    console.log('2. HR: HR001 / password');
  }
}

createTestUsers();
