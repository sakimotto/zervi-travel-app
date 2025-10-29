import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lvbkobrvcfqtyivebrmf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmtvYnJ2Y2ZxdHlpdmVicm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDkyMzUsImV4cCI6MjA3NzE4NTIzNX0.CGh_WTlLO9Q-Ax4Mw3uLIzKSLpRGRCMCs52kPkLV01c'
);

const passwords = [
  'Rada12345',
  'rada12345', 
  'password',
  'Password123',
  'Zervi123',
  'zervi123'
];

async function testPasswords() {
  console.log('Testing different passwords for rada@zervi.com...\n');
  
  for (const pw of passwords) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'rada@zervi.com',
      password: pw
    });
    
    if (!error) {
      console.log(`✅ SUCCESS with password: ${pw}`);
      return;
    } else if (error.message !== 'Database error querying schema') {
      console.log(`❌ ${pw}: ${error.message}`);
    } else {
      console.log(`⚠️  ${pw}: Database error`);
    }
  }
}

testPasswords();
