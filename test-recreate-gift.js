import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function recreateGift() {
  console.log('Creating gift@zervi.com...');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'gift@zervi.com',
    password: 'Gift#Secure2024!Pass',
    options: {
      data: {
        full_name: 'Gift'
      }
    }
  });

  if (authError) {
    console.error('❌ Signup error:', authError.message);
    return;
  }

  console.log('✅ User created successfully!');
  console.log('User ID:', authData.user?.id);
  console.log('Email:', authData.user?.email);

  // Now try to login
  console.log('\nTesting login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'gift@zervi.com',
    password: 'Gift12345'
  });

  if (loginError) {
    console.error('❌ Login error:', loginError.message);
    return;
  }

  console.log('✅ Login successful!');

  // Query a table
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

recreateGift().catch(console.error);
