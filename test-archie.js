import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testArchie() {
  console.log('Testing archie@zervi.com login...');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'archie@zervi.com',
    password: 'Archie#Secure2024!Pass'
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    return;
  }

  console.log('✅ Login successful!');
  console.log('User ID:', data.user.id);

  // Test query
  const { data: queryData, error: queryError } = await supabase
    .from('destinations')
    .select('*')
    .limit(1);

  if (queryError) {
    console.error('❌ Query failed:', queryError.message);
  } else {
    console.log('✅ Database query successful');
  }
}

testArchie().catch(console.error);
