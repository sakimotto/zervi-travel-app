import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lvbkobrvcfqtyivebrmf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c'
);

async function test() {
  console.log('Testing connection to Supabase...\n');
  
  // Test 1: Check if we can query public tables
  console.log('1. Testing public table access...');
  const { data: tables, error: tableError } = await supabase
    .from('appointments')
    .select('id')
    .limit(1);
  
  if (tableError) {
    console.error('  ❌ Table query error:', tableError.message);
  } else {
    console.log('  ✅ Can access public tables');
  }
  
  // Test 2: Try authentication
  console.log('\n2. Testing authentication...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'rada@zervi.com',
    password: 'Rada12345'
  });
  
  if (error) {
    console.error('  ❌ Auth error:', error.message);
    console.error('  Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('  ✅ Authentication successful!');
    console.log('  User:', data.user.email);
  }
}

test();
