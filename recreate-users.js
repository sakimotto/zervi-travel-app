import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbkobrvcfqtyivebrmf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser(email, password, fullName) {
  console.log(`\nCreating ${email}...`);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (authError) {
    console.error(`❌ Signup error for ${email}:`, authError.message);
    return null;
  }

  console.log(`✅ ${email} created successfully!`);
  console.log(`   User ID: ${authData.user?.id}`);
  return authData.user?.id;
}

async function recreateUsers() {
  const users = [
    { email: 'lucas@zervi.com', password: 'Lucas#Secure2024!Pass', fullName: 'Lucas' },
    { email: 'rada@zervi.com', password: 'Rada#Secure2024!Pass', fullName: 'Rada' }
  ];

  const userIds = [];

  for (const user of users) {
    const userId = await createUser(user.email, user.password, user.fullName);
    if (userId) {
      userIds.push({ email: user.email, id: userId, password: user.password });
    }
  }

  console.log('\n=== New User Credentials ===');
  for (const user of userIds) {
    console.log(`\n${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  ID: ${user.id}`);
  }

  return userIds;
}

recreateUsers().catch(console.error);
