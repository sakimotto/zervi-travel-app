import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUser(email, password) {
  console.log(`\nTesting ${email}...`);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error(`❌ Login failed for ${email}:`, authError.message);
    return false;
  }

  console.log(`✅ Login successful for ${email}`);
  return true;
}

async function testAllUsers() {
  const users = [
    { email: 'lucas@zervi.com', password: 'Lucas12345' },
    { email: 'rada@zervi.com', password: 'Rada12345' }
  ];

  for (const user of users) {
    await testUser(user.email, user.password);
  }
}

testAllUsers().catch(console.error);
