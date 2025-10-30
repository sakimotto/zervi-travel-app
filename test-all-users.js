import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUser(email, password) {
  console.log(`\n=== Testing ${email} ===`);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error(`❌ Login failed:`, authError.message);
    return false;
  }

  console.log(`✅ Login successful!`);
  console.log(`   User ID: ${authData.user.id}`);

  // Test querying a table
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .limit(1);

  if (error) {
    console.error(`❌ Query failed:`, error.message);
    return false;
  }

  console.log(`✅ Database query successful`);

  // Sign out
  await supabase.auth.signOut();

  return true;
}

async function testAllUsers() {
  const users = [
    { email: 'gift@zervi.com', password: 'Gift#Secure2024!Pass' },
    { email: 'lucas@zervi.com', password: 'Lucas#Secure2024!Pass' },
    { email: 'rada@zervi.com', password: 'Rada#Secure2024!Pass' }
  ];

  console.log('Testing all user accounts...\n');

  let allPassed = true;
  for (const user of users) {
    const passed = await testUser(user.email, user.password);
    if (!passed) allPassed = false;
  }

  console.log('\n=== Summary ===');
  if (allPassed) {
    console.log('✅ All users can login successfully!');
    console.log('\n=== Credentials ===');
    users.forEach(u => {
      console.log(`\n${u.email}`);
      console.log(`  Password: ${u.password}`);
    });
  } else {
    console.log('❌ Some users failed to login');
  }
}

testAllUsers().catch(console.error);
