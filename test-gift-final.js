import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing login for gift@zervi.com with new password...');

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'gift@zervi.com',
    password: 'Gift#Secure2024!Pass'
  });

  if (authError) {
    console.error('❌ Login error:', authError.message);
    return;
  }

  console.log('✅ Login successful!');
  console.log('User ID:', authData.user.id);
  console.log('Email:', authData.user.email);

  // Query tables
  const tables = ['destinations', 'suppliers', 'business_contacts', 'itinerary_items', 'expenses', 'todos', 'appointments'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Error querying ${table}:`, error.message);
    } else {
      console.log(`✅ ${table} query successful (${data.length} rows)`);
    }
  }
}

testLogin().catch(console.error);
