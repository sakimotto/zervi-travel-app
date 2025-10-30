import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function recreateArchie() {
  console.log('Creating archie@zervi.com...');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'archie@zervi.com',
    password: 'Archie#Secure2024!Pass',
    options: {
      data: {
        full_name: 'Archie'
      }
    }
  });

  if (authError) {
    console.error('❌ Signup error:', authError.message);
    return;
  }

  console.log('✅ Account created successfully!');
  console.log('User ID:', authData.user?.id);
  console.log('\n=== Your New Credentials ===');
  console.log('Email: archie@zervi.com');
  console.log('Password: Archie#Secure2024!Pass');
  console.log('Role: Admin');

  return authData.user?.id;
}

recreateArchie().catch(console.error);
