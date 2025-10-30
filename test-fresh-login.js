import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing login for testfresh@zervi.com...');

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'testfresh@zervi.com',
    password: 'SuperSecure!Pass#2024$Fresh'
  });

  if (authError) {
    console.error('❌ Auth error:', authError.message);
    return;
  }

  console.log('✅ Auth successful! User:', authData.user.email);
  console.log('User ID:', authData.user.id);

  // Now try to query a table
  console.log('\nTesting table query...');
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .limit(1);

  if (error) {
    console.error(`❌ Error querying destinations:`, error.message);
  } else {
    console.log(`✅ destinations query successful (${data.length} rows)`);
  }
}

testLogin().catch(console.error);
