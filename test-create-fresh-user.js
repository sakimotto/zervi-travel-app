import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignUp() {
  console.log('Testing signup for testfresh@zervi.com...');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'testfresh@zervi.com',
    password: 'SuperSecure!Pass#2024$Fresh',
    options: {
      data: {
        full_name: 'Test Fresh User'
      }
    }
  });

  if (authError) {
    console.error('❌ Signup error:', authError.message);
    return;
  }

  console.log('✅ Signup successful!');
  console.log('User ID:', authData.user?.id);
  console.log('Email:', authData.user?.email);
}

testSignUp().catch(console.error);
